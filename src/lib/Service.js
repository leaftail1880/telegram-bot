import clc from "cli-color";
import fs from "fs/promises";
import path from "path";
import config from "../config.js";
import styles from "./styles.js";

import { bot, database, env } from "../index.js";

import "./Class/Command.js";
import "./Class/Query.js";

import { emit } from "./Class/Events.js";
import { util } from "./Class/Utils.js";
import { bold, fmt, FmtString, link, Xitext } from "./Class/Xitext.js";
import { XTimer } from "./Class/XTimer.js";

import { freeze, UpdateServer } from "./launch/between.js";
import { setDataType } from "./launch/dataType.js";
import { handleBotError, handleError } from "./launch/handlers.js";
import { service_lang as lang } from "./launch/lang.js";
import { setupDB } from "./launch/setupDB.js";
import { safeLoad } from "./utils/safe.js";
import { parseError } from "./utils/error.js";

export const data = {
	v: config.version.join("."),

	readableVersion: `v${config.version.join(".")}`,
	logVersion: `v${config.version.join(".")} I`,

	/** @type {'work' | 'realese' | 'old'} */
	type: "realese",

	start_time: Date.now(),

	isLaunched: false,
	isStopped: false,
	isFreezed: false,

	development: env.dev == "true",
	benchmark: true,
	private: true,

	chatID: {
		owner: Number(env.ownerID),
		log: Number(env.logID),
	},
	/** @type {Record<number, 'accepted' | 'waiting'>} */
	joinCodes: {},
	/** @type {Record<string, any>} */
	errorLog: {},
	/** @type {NodeJS.Timer} */
	relaunchTimer: null,
};

export const Service = {
	freeze,
	start,
	stop,
	error,
	message: {
		development: "development",
		terminate_you: "terminate_you",
		terminate_me: "terminate_me",
	},
	safeBotLauch,
	safeBotStop,
	handlers: {
		processError: handleError,
		bot: handleBotError,
	},
};

/**
 *
 * @param {string} msg
 */
export function log(msg) {
	return newlog({
		text: fmt(msg),
		fileMessage: msg,
		consoleMessage: msg,
	});
}

/**
 *
 * @param {{text?: {_ :{build(): [string, any]}} | FmtString; consoleMessage?: string; fileName?: string; fileMessage?: string}} param0
 */
export function newlog({ text, consoleMessage, fileMessage, fileName }) {
	if (consoleMessage) console.log(consoleMessage);

	// Array with async tasks
	const tasks = [];

	if (text) {
		/** @type {[string, any] | [FmtString]} */
		const doneText = "_" in text ? text._.build() : [text];

		tasks.push(bot.telegram.sendMessage(data.chatID.log, doneText[0], doneText[1]));
	}

	if (fileMessage)
		tasks.push(async () => {
			const p = path.join("logs", fileName ?? "logs.txt");
			await fs.writeFile(
				p,
				`[${new Date().toLocaleString([], { hourCycle: "h24" })}] ${fileMessage}\r` + (await fs.readFile(p)).toString()
			);
		});

	return Promise.all(tasks);
}

function safeBotLauch() {
	data.isLaunched = true;
	data.isStopped = false;
	data.isFreezed = false;
	bot.launch();
	data.relaunchTimer = setInterval(() => {
		if (data.isStopped || data.isFreezed) return clearInterval(data.relaunchTimer);
		bot.stop("Relaunch");
		bot.launch();
	}, config.update.pollingRelaunchInterval);
}

function safeBotStop(freeze = false) {
	clearInterval(data.relaunchTimer);
	data.isStopped = true;
	data.isFreezed = freeze;
	bot.stop();
}

/**
 * Запуск бота
 * @returns {Promise<void>}
 */
async function start() {
	const print = lang.state(9);

	print(`${data.development ? clc.yellow("DEV ") : ""}v${config.version.join(".")}`);
	try {
		await fs.mkdir("logs");
	} catch {}

	/**
	 * Seting default get/set values and progress renderers
	 */
	setupDB();

	/**
	 * Connecting to main tables like db.json, users.json and groups.json
	 */
	print("Fetching global db data...");
	await database.Connect();

	setDataType(data);
	print(`Type: ${styles.highlight(data.type)}`);

	bot.catch(Service.handlers.bot);
	bot.telegram.sendMessage(data.chatID.log, ...lang.start());

	/**
	 * Middlewares
	 */
	print("Loading middlewares...");
	await safeLoad(config.middlewares, (s) => import(`../middlewares/${s}/index.js`));

	/**
	 * Modules
	 */
	print("Loading modules...");
	await safeLoad(config.modules, (s) => import(`../modules/${s}/index.js`));

	/**
	 * Connecting to module tables if they exists
	 */
	print("Fetching modules db data...");
	await database.Connect();

	/**
	 * Tells another active sessions that they need to be freezed until development
	 */
	print("Opening sync server...");
	await UpdateServer.open();

	/**
	 * Command and lists initalization
	 */
	print("Setting up enviroment...");
	await emit("modules.load");

	/**
	 * Bot launch
	 */
	print("Launching bot...");
	const me = await bot.telegram.getMe();
	bot.botInfo = me;
	safeBotLauch();

	print(`Ready to work in ${styles.highlight(((Date.now() - data.start_time) / 1000).toFixed(2))}s`);
}

/**
 *
 * @param {string} reason
 * @param {"ALL" | "BOT" | "none"} type
 * @param {boolean} sendMessage
 */
async function stop(reason = "Остановка", type = "none", sendMessage = true) {
	UpdateServer.close();
	const text = new Xitext()._.group("✕  ").url(null, "https://t.me").bold()._.group();

	text.text(`${type}. `);

	text.text(reason);

	text.text("\n" + data.logVersion + " ");
	text.bold(env.whereImRunning);

	let skipMessage = false;
	if (data.development && ["SIGINT", "SIGTERM"].includes(reason)) skipMessage = true;

	if (!skipMessage)
		console.log(styles.error(text._.text.split("\n")[0]) + "\n" + clc.redBright(text._.text.split("\n")[1]));

	if (data.isLaunched && sendMessage && !skipMessage)
		await bot.telegram.sendMessage(data.chatID.log, ...text._.build());

	if (type !== "none" && data.isLaunched && !data.isStopped) {
		data.isStopped = true;
		bot.stop(reason);
	}

	if (type === "ALL") {
		await database.commitAll();
		process.exit(0);
	}
}

const errTimer = new XTimer(5);

/**
 *
 * @param {IhandledError} error
 * @param {{sendMessage: true | "ifNotStopped"}} [options]
 */
async function error(error, options = { sendMessage: "ifNotStopped" }) {
	if (options.sendMessage === "ifNotStopped" && data.isStopped === true) return;
	if (errTimer.isExpired())
		try {
			if (!error.stack) error.stack = Error().stack;
			const [type, message, stack, extra] = parseError(error);

			console.warn(" ");
			console.warn(clc.red(type).trim() + clc.white(message));
			console.warn(stack);
			console.warn(" ");

			const text = fmt`${link(type, "https://t.me/")}${bold(message)}\n${stack}`;

			await bot.telegram.sendMessage(data.chatID.log, text, { disable_web_page_preview: true });

			if (extra) {
				await util.sendSeparatedMessage(
					extra,
					async (a) =>
						await bot.telegram.sendMessage(data.chatID.log, a, {
							disable_web_page_preview: true,
						})
				);
			}
		} catch (e) {
			console.warn(e);
		}
}

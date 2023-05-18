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
import { bold, fmt, FmtString, link } from "./Class/Xitext.js";
import { XTimer } from "./Class/XTimer.js";

import { handleBotError, handleError } from "./launch/handlers.js";
import { service_lang as lang } from "./launch/lang.js";
import { setupDB } from "./launch/setupDB.js";
import { parseError } from "./utils/error.js";
import { safeLoad } from "./utils/safe.js";

export const data = {
	v: config.version.join("."),
	sv: `v${config.version.join(".")}`,

	start_time: Date.now(),

	isLaunched: false,
	isStopped: false,

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
	start,
	stop,
	error,
	message: {
		development: "development",
		terminate_you: "terminate_you",
		terminate_me: "terminate_me",
	},
	safeBotLaunch,
	safeBotStop,
	handlers: {
		processError: handleError,
		bot: handleBotError,
	},
};

/**
 * TODO Make it use fs.open and WriteStream instead of read/writeFile
 * @param {{text?: {_ :{build(): [string, any]}} | FmtString; consoleMessage?: string; fileName?: string; fileMessage?: string}} param0
 */
export function newlog({ text, consoleMessage, fileMessage, fileName }) {
	if (consoleMessage) console.log(consoleMessage);

	// Array with async tasks
	const tasks = [];

	if (text) {
		/** @type {[string, any] | [FmtString]} */
		const doneText = "_" in text ? text._.build() : [text];

		tasks.push(
			bot.telegram.sendMessage(data.chatID.log, doneText[0], doneText[1])
		);
	}

	if (fileMessage)
		tasks.push(async () => {
			const p = path.join("logs", fileName ?? "logs.txt");
			await fs.writeFile(
				p,
				`[${new Date().toLocaleString([], {
					hourCycle: "h24",
				})}] ${fileMessage}\r` + (await fs.readFile(p)).toString()
			);
		});

	return Promise.all(tasks);
}

function safeBotLaunch() {
	data.isLaunched = true;
	data.isStopped = false;
	bot.launch();
	data.relaunchTimer = setInterval(() => {
		if (data.isStopped) return clearInterval(data.relaunchTimer);
		bot.stop("Relaunch");
		bot.launch();
	}, config.update.pollingRelaunchInterval);
}

function safeBotStop() {
	clearInterval(data.relaunchTimer);
	data.isStopped = true;
	bot.stop();
}

/**
 * Запуск бота
 */
async function start() {
	const print = lang.state(8);

	print(
		`${data.development ? clc.yellow("DEV ") : ""}v${config.version.join(".")}`
	);

	if (data.development)
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

	bot.catch(Service.handlers.bot);
	bot.telegram.sendMessage(data.chatID.log, lang.start());

	/**
	 * Middlewares
	 */
	print("Loading middlewares...");
	await safeLoad(config.middlewares, (s) =>
		import(`../middlewares/${s}/index.js`)
	);

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
	 * Command and lists initalization
	 */
	print("Launching load.modules...");
	await emit("load.modules");

	/**
	 * Bot launch
	 */
	print("Launching bot...");
	bot.botInfo = await bot.telegram.getMe();
	safeBotLaunch();

	print(
		`Ready to work in ${styles.highlight(
			((Date.now() - data.start_time) / 1000).toFixed(2)
		)}s`
	);
}

/**
 *
 * @param {string} reason
 * @param {"ALL" | "BOT" | "none"} mode
 * @param {boolean} sendMessage
 */
async function stop(reason = "Остановка", mode = "none", sendMessage = true) {
	console.log(styles.state("Bot", "Stopping..."));

	let message = fmt`${link(bold`✕`, "https://t.me")}  ${mode}. ${reason}`;
	message = fmt`${message}\n${data.sv} ${bold(env.whereImRunning)}`;

	// Skip on dev terminal stop
	const send = !(data.development && ["SIGINT", "SIGTERM"].includes(reason));
	if (send) {
		const [fullreason, info] = message.text.split("\n");
		console.log(styles.error(fullreason) + "\n" + clc.redBright(info));

		if (data.isLaunched && sendMessage)
			await bot.telegram.sendMessage(data.chatID.log, message);
	}

	if (mode !== "none" && data.isLaunched && !data.isStopped) {
		data.isStopped = true;
		bot.stop(reason);
	}

	if (mode === "ALL") {
		if (!database.isClosed) await database.commitAll();
		console.log(styles.state("Bot", "Stopping done."));
		process.exit(0);
	}
}

const ERROR_TIMER = new XTimer(5);

/**
 *
 * @param {IhandledError} error
 */
async function error(error) {
	if (ERROR_TIMER.isExpired())
		try {
			if (!error.stack) error.stack = Error().stack;
			const [type, message, stack, extra] = parseError(error);

			console.warn(" ");
			console.warn(clc.red(type).trim() + clc.white(message));
			console.warn(stack);
			console.warn(" ");

			if (!data.isLaunched || data.isStopped) return;

			const text = fmt`${link(type, "https://t.me/")}${bold(
				message
			)}\n${stack}`;

			await bot.telegram.sendMessage(data.chatID.log, text, {
				disable_web_page_preview: true,
			});

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
			console.warn(new Error(e.message, { cause: error }));
		}
}

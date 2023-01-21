import clc from "cli-color";
import fs from "fs/promises";
import path from "path";
import config from "../config.js";
import styles from "./styles.js";

import { bot, DBManager, env } from "../index.js";

import "./Class/Command.js";
import "./Class/Query.js";

import { emit } from "./Class/Events.js";
import { util } from "./Class/Utils.js";
import { Xitext } from "./Class/Xitext.js";
import { XTimer } from "./Class/XTimer.js";

import { freeze, UpdateServer } from "./launch/between.js";
import { setDataType } from "./launch/dataType.js";
import { handleBotError, handleError } from "./launch/handlers.js";
import { service_lang as lang } from "./launch/lang.js";
import { setupDB } from "./launch/setupDB.js";

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
	errorLog: {},
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
		xitext: new Xitext().text(msg),
		fileMessage: msg,
		consoleMessage: msg,
	});
}

/**
 *
 * @param {{xitext?: Xitext; consoleMessage?: string; fileName?: string; fileMessage?: string}} param0
 */
export function newlog({ xitext, consoleMessage, fileMessage, fileName }) {
	if (consoleMessage) console.log(consoleMessage);

	// Array with async jobs
	const jobs = [];

	// Start job and push it to array
	if (xitext) jobs.push(bot.telegram.sendMessage(data.chatID.log, ...xitext._.build()));

	// fs.appendFile doesnt waiting for telegram to send message
	if (fileMessage)
		jobs.push(async () => {
			const p = path.join("logs", fileName ?? "logs.txt");
			await fs.writeFile(
				p,
				`[${new Date().toLocaleString([], { hourCycle: "h24" })}] ${fileMessage}\r` + (await fs.readFile(p)).toString()
			);
		});

	// Resolves when all jobs are done
	return Promise.all(jobs);
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
 * It loads all the files in a folder and logs the time it took to load each file
 * @param {string[]} folderArray - An array of folders to load.
 * @param  {string}dirFolder - The folder that the files are in.
 */
async function LoadFromArray(folderArray, dirFolder) {
	for (const folder of folderArray) {
		try {
			const start = performance.now();

			await import(`../${dirFolder}/${folder}/index.js`);

			console.log(`${styles.load}${folder} (${clc.yellowBright(`${(performance.now() - start).toFixed(2)} ms`)})`);
		} catch (e) {
			console.log(`${styles.loadError}${folder}`);
			Service.error(e);
		}
	}
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
	await DBManager.Connect();

	setDataType(data);
	print(`Type: ${styles.highlight(data.type)}`);

	bot.catch(Service.handlers.bot);
	bot.telegram.sendMessage(data.chatID.log, ...lang.start());

	/**
	 * Middlewares
	 */
	print("Loading middlewares...");
	await LoadFromArray(config.middlewares, "middlewares");

	/**
	 * Modules
	 */
	print("Loading modules...");
	await LoadFromArray(config.modules, "modules");

	/**
	 * Connecting to module tables if they exists
	 */
	print("Fetching modules db data...");
	await DBManager.Connect();

	/**
	 * Tells another active sessions that they need to be freezed until development
	 */
	print("Opening sync server...");
	await UpdateServer.open();

	/**
	 * Command and lists initalization
	 */
	print("Setting up enviroment...");
	await emit("modules.load", "");

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
		await DBManager.commitAll();
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
			const [type, message, stack, extra] = util.errParse(error, true);

			console.warn(" ");
			console.warn(clc.red(type).trim() + " " + clc.white(message));
			console.warn(" " + stack);
			console.warn(" ");

			const text = new Xitext().url(type, "https://t.me")._.group(message).bold()._.group().text(` ${stack}`);

			await bot.telegram.sendMessage(data.chatID.log, ...text._.build());

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

import clc from "cli-color";
import fs from "fs/promises";
import { createClient } from "redis";
import config from "../config.js";
import { database } from "../index.js";
import "./Class/Command.js";
import { TriggerEventListeners } from "./Class/Events.js";
import "./Class/Query.js";
import { util } from "./Class/Utils.js";
import { Xitext } from "./Class/Xitext.js";
import { bot, env } from "./launch/tg.js";
import { updateInfo } from "./launch/update.js";

export const data = {
	v: config.version.join("."),

	publicVersion: `v${config.version.join(".")}`,
	logVersion: `v${config.version.join(".")} I`,
	/** @type {'work' | 'realese' | 'old'} */
	type: "realese",

	session: 0,
	start_time: Date.now(),

	isLaunched: false,
	isStopped: false,
	isFreezed: false,

	development: env.dev == "true",
	benchmark: true,
	private: true,

	chatID: {
		// Айди чата, куда будут поступать сообщения
		owner: Number(env.ownerID),
		log: Number(env.logID),
	},
	/** @type {Record<number, 'accepted' | 'waiting'>} */
	joinCodes: {},
	errorLog: {},
	updateTimer: null,
	relaunchTimer: null,
};

import path from "path";
import { XTimer } from "./Class/XTimer.js";
import { freeze, UpdateCheckTimer } from "./launch/between.js";
import { handleBotError, handleDB, handleError } from "./launch/handlers.js";
import { start_stop_lang as lang } from "./launch/lang.js";
import styles from "./styles.js";

export const SERVISE = {
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
};

export const handlers = {
	processError: handleError,
	dbError: handleDB,
	bot: handleBotError,
};

export function clearLines(count = -1) {
	process.stdout.moveCursor(0, count); // up one line
	process.stdout.clearLine(1); // from cursor to end
}

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
				`[${new Date().toLocaleString([], { hourCycle: "h24" })}] ${fileMessage}\r` + (await fs.readFile(p))
			);
		});

	// Resolves when all jobs are done
	return Promise.all(jobs);
}

function safeBotLauch() {
	bot.launch();
	data.isStopped = false;
	data.isFreezed = false;
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
	lang.log.start();
	try {
		await fs.mkdir("logs");
	} catch {}

	/**======================
	 * Подключение к базе данных
	 *========================**/
	const client = createClient({
		url: process.env.REDIS_URL,
	});

	client.on("error", handlers.dbError);

	// Сохранение клиента
	lang.log.db();
	await database._.connect(client);

	// Обновляет сессию
	await updateInfo(data);
	lang.log.session();

	bot.catch(handlers.bot);

	bot.telegram.sendMessage(data.chatID.log, ...lang.start());

	/**======================
	 * Загрузка плагинов
	 *========================**/
	const progress_bar1 = lang.log.modules();
	const m = [];
	for (const module of config.modules) {
		const start = performance.now();

		await import(`../modules/${module}/index.js`).catch(SERVISE.error);

		m.push(`${module} (${clc.yellowBright(`${(performance.now() - start).toFixed(2)} ms`)})`);
		progress_bar1.increment();
	}
	progress_bar1.stop();
	clearLines(-1);

	// Инициализация команд и списков
	TriggerEventListeners("modules.load", "");

	/**======================
	 * Запуск бота
	 *========================**/
	const me = await bot.telegram.getMe();
	bot.botInfo = me;
	bot.launch();
	data.isLaunched = true;

	lang.log.end(m);
	UpdateCheckTimer.open();
}

/**
 *
 * @param {string} reason
 * @param {"ALL" | "BOT" | "none"} type
 * @param {boolean} sendMessage
 */
async function stop(reason = "Остановка", type = "none", sendMessage = true) {
	UpdateCheckTimer.close();
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
		await database._.close();
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

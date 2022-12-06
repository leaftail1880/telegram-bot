import { createClient } from "redis";
import config from "../config.js";
import { database } from "../index.js";
import "./Class/Command.js";
import { triggerEvent } from "./Class/Events.js";
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

	development: env.dev === true,
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
};

import { freeze, UpdateCheckTimer } from "./launch/between.js";
import { handleBotError, handleDB, handleError } from "./launch/handlers.js";
import { start_stop_lang as lang } from "./launch/lang.js";
import { XTimer } from "./Class/XTimer.js";

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
};

export const handlers = {
	processError: handleError,
	dbError: handleDB,
	bot: handleBotError,
};

export function log(msg, extra = {}, owner = false) {
	console.log(msg);
	owner
		? bot.telegram.sendMessage(data.chatID.owner, msg, extra)
		: bot.telegram.sendMessage(data.chatID.log, msg, extra);
}

/**
 * Запуск бота
 * @returns {Promise<void>}
 */
async function start() {
	lang.log.start();

	/**======================
	 * Подключение к базе данных
	 *========================**/
	const time = performance.now();

	const client = createClient({
		url: process.env.REDIS_URL,
	});

	client.on("error", handlers.dbError);

	// Сохранение клиента
	await database._.connect(client, time);

	// Обновляет сессию
	await updateInfo(data);

	bot.catch(handlers.bot);

	bot.telegram.sendMessage(data.chatID.log, ...lang.start());

	/**======================
	 * Загрузка плагинов
	 *========================**/
	const m = [];
	for (const module of config.modules) {
		const start = performance.now();

		await import(`../modules/${module}/index.js`).catch(SERVISE.error);

		m.push(`${module} (${(performance.now() - start).toFixed(2)} ms)`);
	}
	// Инициализация команд и списков
	triggerEvent("modules.load");

	/**======================
	 * Запуск бота
	 *========================**/
	await bot.launch();
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

	console.log(text._.text);
	if (data.isLaunched && sendMessage) await bot.telegram.sendMessage(data.chatID.log, ...text._.build());

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
 * @param {import("./launch/typess.js").IhandledError} error
 * @param {{sendMessage: true | "ifNotStopped"}} [options]
 */
async function error(error, options = { sendMessage: "ifNotStopped" }) {
	if (errTimer.isExpired())
		try {
			const [type, message, stack, extra] = util.errParse(error, true);

			if (!data.isLaunched || (options.sendMessage === "ifNotStopped" && data.isStopped === true)) return;

			console.warn(" ");
			console.warn(type);
			console.warn(message);
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

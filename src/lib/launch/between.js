// This file contains code for synchronization/shutdown/data exchange between several bot processes running at the same time.

import clc from "cli-color";
import config from "../../config.js";
import { bot, data, database, DBManager, log, newlog, Service } from "../../index.js";
import { OpenServer, SendMessage } from "../utils/net.js";
import { service_lang as lang } from "./lang.js";
import { bigger, setDataType } from "./update.js";

export const UpdateServer = {
	passcode: "test",
	isClosed: false,
	ip: OpenServer(~~(Math.random() * 10000), (message) => {
		if (UpdateServer.isClosed) return "closed";

		/** @type {{passcode: string; version?: [number, number, number]; message?: string}} */
		let request;
		try {
			request = JSON.parse(message);
		} catch (e) {
			console.log(e);
			return `Bad json: ${e.message}`;
		}

		if (request.passcode !== UpdateServer.passcode) return "Bad passcode";

		if (request.message === Service.message.development) {
			freeze();
			return "true";
		}

		/**
		 * @type {typeof data.type}
		 */
		const q = bigger([config.version[0], config.version[1], config.version[2]], request.version, [
			"realese",
			"old",
			"work",
		]);

		if (data.development) return Service.message.development;

		if (q === "realese") return Service.message.terminate_you;

		if (q === "old" || q === "work") {
			Service.stop(lang.stop.old(), "ALL");
			return Service.message.terminate_me;
		}
	}),
	async open() {
		await database._.reconnect();
		const activeIP = database.get(config.dbkey.ip);
		const activePASSCODE = database.get(config.dbkey.ip_passcode);
		if (activeIP !== UpdateServer.ip) {
			if (data.development)
				try {
					await SendMessage(
						activeIP,
						JSON.stringify({ passcode: activePASSCODE, message: Service.message.development })
					);
				} catch {}

			database.set(config.dbkey.ip, UpdateServer.ip);
			database.set(config.dbkey.ip_passcode, UpdateServer.passcode);
			await database._.commit();
		}

		this.isClosed = false;
	},
	close() {
		this.isClosed = true;
	},
};

export async function freeze() {
	if (data.isFreezed) return;
	data.isFreezed = true;
	UpdateServer.close();
	database._.close();
	if (data.isLaunched) {
		const l = lang.stop.freeze();
		newlog({
			xitext: l,
			consoleMessage: clc.bgCyanBright.black(l._.text),
			fileMessage: l._.text,
		});
	}

	if (data.isLaunched && !data.isStopped) {
		bot.stop("freeze");
		data.isStopped = true;
	}

	let times = 0;
	let devTimes = 0;
	let selfTimes = 0;
	let timeout;

	async function Check() {
		await database._.connect();
		const ip = database.get(config.dbkey.ip);
		if (ip === UpdateServer.ip) {
			selfTimes++;
			if (selfTimes < 2) return;
		}
		const passcode = database.get(config.dbkey.ip_passcode);
		let answer;

		try {
			answer = await SendMessage(
				ip,
				JSON.stringify({ passcode, version: [config.version[0], config.version[1], config.version[2]] })
			);
		} catch (e) {
			if (e.name === "FetchError") return launch("Не смог достучаться до сервера разработки: " + e.message, "↩️");
			throw e;
		}

		if (answer?.startsWith("Bad json:")) {
			return Service.stop(answer, "ALL");
		}

		if (answer === "closed") {
			return launch("Запрашиваемый сервер заморожен");
		}

		if (answer === Service.message.terminate_you) {
			return Service.stop(lang.stop.terminate(), "ALL");
		}

		if (answer === Service.message.terminate_me) {
			return launch("Запущена как новая", "NEW");
		}
		if (answer === Service.message.development) {
			if (devTimes === 0) log("Ожидает конца разработки...");
			devTimes++;
			times = 0;
			return;
		}

		times++;
		console.log(times >= 1 ? `Нет ответа ${times}` : `Ждет ответ...`);
		if (times >= 1) {
			const message = devTimes
				? `Запущена после разработки [${((devTimes * config.update.timerTime) / 1000).toFixed(2)} сек]`
				: `Не получила ответа`;

			await launch(message, "↩️");
			return;
		}
	}

	Check();

	timeout = setInterval(Check, config.update.timerTime);

	/**
	 *
	 * @param {string} info
	 * @param {string} [prefix]
	 */
	async function launch(info, prefix) {
		if (timeout) clearInterval(timeout);
		if (data.isStopped === false) return;

		const message = lang.launch(info);
		newlog({
			fileMessage: message,
			consoleMessage: message,
		});
		data.start_time = Date.now();

		/**
		 * Updates data.v, data.versionMSG, data.isLatest, version и session
		 */
		await setDataType(data);

		/**
		 * Updates local cache to actual data
		 */
		for (const table in DBManager.tables) DBManager.tables[table]._.isConnected = false;
		await DBManager.Connect();

		await UpdateServer.open();
		Service.safeBotLauch();

		bot.telegram.sendMessage(data.chatID.log, ...lang.start(info, prefix));
		console.log("Запущен.");
	}
}

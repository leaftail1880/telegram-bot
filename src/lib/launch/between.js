// This file contains code for synchronization/shutdown/data exchange between several bot processes running at the same time.

import clc from "cli-color";
import config from "../../config.js";
import {
	bot,
	data,
	database,
	env,
	log,
	newlog,
	Service,
	tables,
} from "../../index.js";
import styles from "../styles.js";
import { OpenServer, SendBotMessage } from "../utils/net.js";
import { bigger, setDataType } from "./dataType.js";
import { service_lang as lang } from "./lang.js";

export const UpdateServer = {
	passcode: env.P ?? "test",
	isClosed: false,
	isFirstOpen: true,
	ip: OpenServer(Math.floor(Math.random() * 30000 + 3000), (message) => {
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
		const q = bigger(config.version, request.version, [
			"realese",
			"old",
			"work",
		]);

		if (data.development) return Service.message.development;

		if (q === "realese") return Service.message.terminate_you;

		if (q === "old" || q === "work") {
			Service.stop(lang.message.old(), "ALL");
			return Service.message.terminate_me;
		}
	}),
	/**
	 * Sends [SyncServer] message to console with colors from styles.state
	 * @param {string} message
	 */
	progress(message) {
		console.log(styles.state("SyncServer", message));
	},

	async open() {
		UpdateServer.progress(this.isFirstOpen ? "Opening..." : "Reopening...");
		await database.Reconnect();

		const activeIP = tables.main.get(config.dbkey.ip);
		const activePASSCODE = tables.main.get(config.dbkey.ip_passcode);
		if (activeIP !== UpdateServer.ip) {
			if (data.development)
				try {
					await SendBotMessage({
						ip: activeIP,
						passcode: activePASSCODE,
						message: "development",
					});
					UpdateServer.progress("Another bot entered dev mode.");
				} catch {}

			tables.main.set(config.dbkey.ip, UpdateServer.ip);
			tables.main.set(config.dbkey.ip_passcode, UpdateServer.passcode);
			await tables.main._.commit();
			UpdateServer.progress(
				this.isFirstOpen ? "Successfully opened." : "Successfully reopened."
			);

			this.isFirstOpen = false;
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
	database.Close();
	if (data.isLaunched) {
		const l = lang.message.freeze();
		newlog({
			text: l,
			consoleMessage: clc.bgCyanBright.black(l.text),
			fileMessage: l.text,
		});
	}

	if (data.isLaunched && !data.isStopped) {
		bot.stop("freeze");
		data.isStopped = true;
	}

	let times = 0;
	let devTimes = 0;
	let selfTimes = 0;
	/** @type {NodeJS.Timer} */
	let timeout;

	async function Check() {
		await tables.main._.connect();
		const ip = tables.main.get(config.dbkey.ip);
		if (ip === UpdateServer.ip) {
			selfTimes++;
			if (selfTimes < 2) return;
		}
		const passcode = tables.main.get(config.dbkey.ip_passcode);
		let answer;

		try {
			answer = await SendBotMessage({ ip, passcode, version: config.version });
		} catch (e) {
			if (e.name === "FetchError")
				return launch("Сервер разработки не ответил:\n" + e.message, "↩️");
			throw e;
		}

		if (answer?.startsWith("Bad json:")) {
			return Service.stop(answer, "ALL");
		}

		if (answer === "closed") {
			return launch(
				"Запрашиваемый бот заморожен (Сервер помечен как закрытый)"
			);
		}

		if (answer === Service.message.terminate_you) {
			return Service.stop(lang.message.terminate(), "ALL");
		}

		if (answer === Service.message.terminate_me) {
			return launch("Другой бот решил что он старый", "NEW");
		}
		if (answer === Service.message.development) {
			if (devTimes === 0) log(lang.message.development());
			devTimes++;
			times = 0;
			return;
		}

		times++;
		console.log(times >= 1 ? `Нет ответа ${times}` : `Ждет ответ...`);
		if (times >= 1) {
			const message = devTimes
				? `Запущена после разработки длиной в ${(
						(devTimes * config.update.timerTime) /
						1000
				  ).toFixed(2)} сек`
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

		const print = lang.state(2);
		const message = lang.launch(info);
		newlog({
			fileMessage: message,
			consoleMessage: message,
		});
		data.start_time = Date.now();

		/**
		 * Updates data.v, data.versionMSG, data.isLatest, version и session
		 */
		setDataType(data);

		/**
		 * Updates local cache to actual data
		 */
		for (const table in database.tables)
			database.tables[table]._.isConnected = false;
		print("Connecting to db...");
		await database.Connect();

		await UpdateServer.open();
		Service.safeBotLaunch();

		bot.telegram.sendMessage(data.chatID.log, lang.start(info, prefix));
		print("Relaunching done.");
	}
}

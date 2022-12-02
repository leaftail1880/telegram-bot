// This file contains code for synchronization/shutdown/data exchange between several bot processes running at the same time.

import config from "../../config.js";
import { database } from "../../index.js";
import { data, log, SERVISE } from "../SERVISE.js";
import { start_stop_lang as lang } from "./lang.js";
import { bot } from "./tg.js";
import { bigger, updateInfo } from "./update.js";

/** @type {NodeJS.Timer} */
let $UpdateCheckTimer;

export const UpdateCheckTimer = {
	open() {
		$UpdateCheckTimer = setInterval(updateCheckInterval, config.update.timerTime);
	},
	close() {
		clearInterval($UpdateCheckTimer);
	},
};

async function updateCheckInterval() {
	if (!database.client) return;
	const query = await database.get(config.dbkey.request, true);

	if (!query?.map) return;
	/**
	 * @type {typeof data.type}
	 */
	const q = bigger([config.version[0], config.version[1], config.version[2]], query, ["realese", "old", "work"]);

	function answer(/** @type {string} */ message) {
		return database.set(config.dbkey.request, message);
	}

	if (data.development) return await answer(SERVISE.message.development);

	if (q === "realese") return await answer(SERVISE.message.terminate_you);

	if (q === "old" || q === "work") {
		await answer(SERVISE.message.terminate_me);
		return SERVISE.stop(lang.stop.old(), "ALL");
	}
}

export async function freeze() {
	UpdateCheckTimer.close();
	if (data.launched)
		await bot.telegram.sendMessage(data.chatID.log, ...lang.stop.freeze()), console.log(lang.stop.freeze()[0]);

	if (data.launched && !data.stopped) {
		data.stopped = true;
		bot.stop("freeze");
	}

	function updateRequest() {
		return database.set(config.dbkey.request, [config.version[0], config.version[1], config.version[2]], true, 300);
	}

	await updateRequest();

	let times = 0,
		devTimes = 0;
	const timeout = setInterval(async () => {
		const answer = await database.get(config.dbkey.request);
		if (answer === SERVISE.message.terminate_you) {
			await database.delete(config.dbkey.request);
			return SERVISE.stop(lang.stop.terminate(), "ALL");
		}

		if (answer === SERVISE.message.terminate_me) {
			await launch("As newest", "Запущена как новая");
			return;
		}
		if (answer === SERVISE.message.development) {
			log("Entering develompend pending mode...");
			console.log(`(${devTimes === 0 ? times : devTimes}) Waiting for end of dev...`);
			devTimes++;
			times = 0;
			await updateRequest();
			return;
		}

		times++;
		console.log("No response", times);
		if (times >= 1) {
			await launch("No response", "Нет ответа", "↩️");
			return;
		}
	}, config.update.timerTime);

	/**
	 *
	 * @param {string} log
	 * @param {string} chat
	 * @param {string} [prefix]
	 */
	async function launch(log, chat, prefix) {
		clearInterval(timeout);
		if (data.stopped === false) return;
		data.start_time = Date.now();

		// Обновляет сессию, data.v, data.versionMSG, data.isLatest, version и session
		await updateInfo(data);

		/**======================
		 * Запуск бота
		 *========================**/
		await bot.launch();

		data.stopped = false;
		data.launched = true;
		console.log(lang.logLaunch(log));
		bot.telegram.sendMessage(data.chatID.log, ...lang.start(chat, prefix));

		UpdateCheckTimer.open();
		database.delete(config.dbkey.request);
	}
}

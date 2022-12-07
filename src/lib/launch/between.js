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
	if (database.isClosed) return;

	const query = await database.get(config.dbkey.request, true);
	if (!Array.isArray(query)) return;

	/**
	 * @type {typeof data.type}
	 */
	const q = bigger([config.version[0], config.version[1], config.version[2]], query, ["realese", "old", "work"]);

	function answer(/** @type {string} */ message) {
		return database.set(config.dbkey.request, message);
	}

	console.warn(data.development);
	if (data.development) return await answer(SERVISE.message.development);

	if (q === "realese") return await answer(SERVISE.message.terminate_you);

	if (q === "old" || q === "work") {
		await answer(SERVISE.message.terminate_me);
		return SERVISE.stop(lang.stop.old(), "ALL");
	}
}

export async function freeze() {
	if (data.isFreezed) return;
	data.isFreezed = true;
	UpdateCheckTimer.close();
	if (data.isLaunched)
		await bot.telegram.sendMessage(data.chatID.log, ...lang.stop.freeze()), console.log(lang.stop.freeze()[0]);

	if (data.isLaunched && !data.isStopped) {
		data.isStopped = true;
		bot.stop("freeze");
	}

	function updateRequest() {
		return database.set(config.dbkey.request, [config.version[0], config.version[1], config.version[2]], true, 300);
	}

	await updateRequest();

	let times = 0;
	let devTimes = 0;

	const timeout = setInterval(async () => {
		const answer = await database.get(config.dbkey.request);
		if (answer === SERVISE.message.terminate_you) {
			await database.delete(config.dbkey.request);
			return SERVISE.stop(lang.stop.terminate(), "ALL");
		}

		if (answer === SERVISE.message.terminate_me) {
			await launch("Запущена как новая", "NEW");
			return;
		}
		if (answer === SERVISE.message.development) {
			if (devTimes === 0) log("Вход в режим ожидания...");
			console.log(`(${devTimes === 0 ? times : devTimes}) Ожидание конца разработки...`);
			devTimes++;
			times = 0;
			await updateRequest();
			return;
		}

		times++;
		console.log("Нет ответа", times);
		if (times >= 1) {
			await launch("Не получила ответа", "↩️");
			return;
		}
	}, config.update.timerTime);

	/**
	 *
	 * @param {string} info
	 * @param {string} [prefix]
	 */
	async function launch(info, prefix) {
		clearInterval(timeout);
		if (data.isStopped === false) return;
		data.start_time = Date.now();

		// Обновляет сессию, data.v, data.versionMSG, data.isLatest, version и session
		await updateInfo(data);

		/**======================
		 * Запуск бота
		 *========================**/
		await bot.launch();

		data.isStopped = false;
		data.isLaunched = true;
		data.isFreezed = false;
		console.log(lang.logLaunch(info));
		bot.telegram.sendMessage(data.chatID.log, ...lang.start(info, prefix));

		UpdateCheckTimer.open();
		database.delete(config.dbkey.request);
	}
}

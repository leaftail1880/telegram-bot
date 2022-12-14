// This file contains code for synchronization/shutdown/data exchange between several bot processes running at the same time.

import clc from "cli-color";
import config from "../../config.js";
import { database } from "../../index.js";
import { data, log, newlog, SERVISE } from "../SERVISE.js";
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

	const query = await database.getActualData(config.dbkey.request, true);
	if (!Array.isArray(query)) return;

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
	if (data.isFreezed) return;
	data.isFreezed = true;
	UpdateCheckTimer.close();
	if (data.isLaunched) {
		const l = lang.stop.freeze();
		newlog({
			xitext: {
				// @ts-expect-error
				_: {
					build() {
						return l;
					},
				},
			},
			consoleMessage: clc.bgCyanBright.black(l[0]),
			fileMessage: l[0],
		});
	}

	if (data.isLaunched && !data.isStopped) {
		data.isStopped = true;
		bot.stop("freeze");
	}

	async function updateRequest() {
		await database.set(config.dbkey.request, [config.version[0], config.version[1], config.version[2]]);
		await database.client.expire(config.dbkey.request, 300);
	}

	await updateRequest();

	let times = 0;
	let devTimes = 0;

	const timeout = setInterval(async () => {
		const answer = await database.getActualData(config.dbkey.request);
		if (answer === SERVISE.message.terminate_you) {
			await database.delete(config.dbkey.request);
			return SERVISE.stop(lang.stop.terminate(), "ALL");
		}

		if (answer === SERVISE.message.terminate_me) {
			await launch("???????????????? ?????? ??????????", "NEW");
			return;
		}
		if (answer === SERVISE.message.development) {
			if (devTimes === 0) log("?????????????? ?????????? ????????????????????...");
			devTimes++;
			times = 0;
			await updateRequest();
			return;
		}

		times++;
		console.log(times >= 1 ? `?????? ???????????? ${times}` : `???????? ??????????...`);
		if (times >= 1) {
			await launch(
				devTimes
					? `???????????????? ?????????? ???????????????????? [${((devTimes * config.update.timerTime) / 1000).toFixed(2)} ??????]`
					: `???? ???????????????? ????????????`,
				"??????"
			);
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

		// ?????????????????? ????????????, data.v, data.versionMSG, data.isLatest, version ?? session
		await updateInfo(data);

		/**======================
		 * ???????????? ????????
		 *========================**/
		SERVISE.safeBotLauch();

		const message = lang.logLaunch(info);
		newlog({
			fileMessage: message,
			consoleMessage: message,
		});
		bot.telegram.sendMessage(data.chatID.log, ...lang.start(info, prefix));

		UpdateCheckTimer.open();
		database.delete(config.dbkey.request);
	}
}

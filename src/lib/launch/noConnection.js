import clc from "cli-color";
import config from "../../config.js";
import { database } from "../../index.js";
import { XTimer } from "../Class/XTimer.js";
import { data } from "../SERVISE.js";
import { bot } from "./tg.js";

const Connect = {
	/** @type {NodeJS.Timer} */
	Intervall: null,
	/** @type {Function} */
	Resolve: null,
	/** @type {Promise} */
	Promise: null,
};

const ErrorLog = new XTimer(config.ErrorCooldown);

/**
 *
 * @param {string} [type]
 * @returns
 */
export async function noConnection(type) {
	if (data.isLaunched && !data.isStopped) {
		bot.stop("NOCONNECTION");
		data.isStopped = true;
	}
	if (!database.isClosed) database._.close(false);

	if (ErrorLog.isExpired()) {
		console.log(clc.redBright(`Нет подключения к интернету ${type ? `${type}` : ""}`));
	}

	if (!Connect.Interval) {
		Connect.Interval = setInterval(timer, config.ReconnectTimerWaitTime * 1000);
	}

	if (!Connect.Promise) {
		Connect.Promise = new Promise((resolve) => {
			Connect.Resolve = resolve;
		});
	} else return Connect.Promise;
}

async function timer() {
	try {
		if (!data.isStopped) return;
		await bot.telegram.getMe();

		await database._.connect(null, Date.now());
		bot.launch();
		data.isStopped = false;

		console.log(clc.greenBright("Подключение восстановлено!"));

		clearInterval(Connect.Interval);
		delete Connect.Interval;

		Connect.Resolve();
		delete Connect.Promise;
		delete Connect.Resolve;
	} catch (e) {}
}

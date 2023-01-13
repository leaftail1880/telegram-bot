import config from "../../config.js";
import { bot, database } from "../../index.js";
import { XTimer } from "../Class/XTimer.js";
import { data, Service } from "../Service.js";
import styles from "../styles.js";

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
		data.isStopped = true;
		bot.stop("NOCONNECTION");
	}
	if (!database.isClosed) database._.close(false);

	if (ErrorLog.isExpired()) {
		console.log(styles.noConnection(`Нет подключения к интернету ${type ? `${type}` : ""}`));
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

		await database._.reconnect();
		Service.safeBotLauch();

		console.log(styles.connectionResolved("Подключение восстановлено!"));

		clearInterval(Connect.Interval);
		delete Connect.Interval;

		Connect.Resolve();
		delete Connect.Promise;
		delete Connect.Resolve;
	} catch (e) {}
}

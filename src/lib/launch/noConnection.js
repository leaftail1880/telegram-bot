import config from "../../config.js";
import { bot, data, database, Service } from "../../index.js";
import { XTimer } from "../Class/XTimer.js";
import styles from "../styles.js";

const Connect = {
	/** @type {NodeJS.Timer} */
	Interval: null,
	/** @type {Function} */
	Resolve: null,
	/** @type {Promise<void>} */
	Promise: null,
};

const ErrorLog = new XTimer(config.NoConnectionLogCooldown);

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
	if (!database.isClosed) database.Close();

	if (ErrorLog.isExpired()) {
		console.log(
			styles.noConnection(
				`Нет подключения к интернету ${type ? `${type}` : ""}`
			)
		);
	}

	if (!Connect.Interval) {
		Connect.Interval = setInterval(timer, config.ReconnectTimerWaitTime * 1000);
	}

	if (!Connect.Promise) {
		Connect.Promise = new Promise((resolve) => {
			Connect.Resolve = () => {
				resolve();
				delete Connect.Promise;
				delete Connect.Resolve;
			};
		});
	}
	return Connect.Promise;
}

async function timer() {
	if (!data.isStopped) return;

	try {
		// Checking if external services are avaible
		await bot.telegram.getMe();
	} catch (e) {
		if (e.name === "FetchError") return;

		// Oops, not a network error
		throw e;
	}

	await database.Reconnect();
	Service.safeBotLaunch();

	console.log(styles.connectionResolved("Подключение восстановлено!"));

	clearInterval(Connect.Interval);
	delete Connect.Interval;

	// Call waiting for connection resolve functiom
	Connect.Resolve();
}

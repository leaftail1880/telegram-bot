import config from "../../config.js";
import { bot, data, database, Service } from "../../index.js";
import { XTimer } from "../Class/XTimer.js";
import styles from "../styles.js";

const CONNECT = {
	/** @type {NodeJS.Timer} */
	Interval: null,
	/** @type {Function} */
	Resolve: null,
	/** @type {Promise<void>} */
	Promise: null,
};

const ERROR_TIMER = new XTimer(config.NoConnectionLogCooldown);

/**
 * @param {string} [type]
 */
export async function noConnection(type) {
	if (data.isLaunched && !data.isStopped) {
		data.isStopped = true;
		bot.stop("NOCONNECTION");
	}
	database.isClosed = true;

	if (ERROR_TIMER.isExpired()) {
		console.log(
			styles.noConnection(
				`Нет подключения к интернету ${type ? `${type}` : ""}`
			)
		);
	}

	if (!CONNECT.Interval) {
		CONNECT.Interval = setInterval(timer, config.ReconnectTimerWaitTime * 1000);
	}

	if (!CONNECT.Promise) {
		CONNECT.Promise = new Promise((resolve) => {
			CONNECT.Resolve = () => {
				resolve();
				delete CONNECT.Promise;
				delete CONNECT.Resolve;
			};
		});
	}
	return CONNECT.Promise;
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

	clearInterval(CONNECT.Interval);
	delete CONNECT.Interval;

	// Call waiting for connection resolve function
	CONNECT.Resolve();
}

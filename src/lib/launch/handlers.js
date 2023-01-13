import clc from "cli-color";
import { bot, database } from "../../index.js";
import { XTimer } from "../Class/XTimer.js";
import { data, Service } from "../Service.js";
import { noConnection } from "./noConnection.js";

/**
 * @type {IOnErrorActions}
 */
const OnError = {
	timer: new XTimer(5),
	codes: {
		ECONNRESET: () => noConnection("Err CONNECTION RESET"),
		ERR_MODULE_NOT_FOUND: (err) => {
			Service.error(err);
		},
		409: () => Service.freeze(),
		400: (err) => {
			if (err?.response?.description?.includes("not enough rights")) {
				bot.telegram.sendMessage(
					err.on.payload.chat_id,
					'У бота нет разрешений для выполнения действия "' + err.on.method + '"'
				);
				return;
			}
			Service.error(err);
		},
		429: (err) => {
			if (OnError.timer.isExpired()) console.warn(err.stack);
		},
		413: (err) => {
			Service.error(err);
		},
	},
	types: {
		FetchError: () => noConnection("Unhandled FetchError"),
	},
};

/**
 * @param {IhandledError} err
 */
export async function handleError(err) {
	const code_action = OnError.codes[err?.response?.error_code];
	const type_action = OnError.types[err?.name];

	if (type_action) {
		type_action(err);
	} else if (code_action) {
		code_action(err);
	} else Service.error(err);

	data.errorLog[err?.name] = data.errorLog[err?.name] ?? [];
	data.errorLog[err?.name].push(err);
}

/**
 *
 * @param {Error & {code: string}} err
 * @returns
 */
export async function handleDB(err) {
	if (err.message === "Client IP address is not in the allowlist.") {
		await Service.stop("Put your ip addres to db allowlist", "ALL", false);
		return;
	}
	if (err.message === "Socket closed unexpectedly") {
		await database._.reconnect();
		return;
	}
	noConnection();
}

/**
 *
 * @param {Error & {code: string; stack: string}} err
 * @returns
 */
export async function handleBotError(err) {
	if (err && err.name === "FetchError") noConnection(clc.cyanBright("Telegraf"));
	else Service.error(err);
}

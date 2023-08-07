import { bot, Service } from "../../index.js";
import styles from "../styles.js";
import { Cooldown } from "../utils/cooldown.js";
import { noConnection } from "./noConnection.js";

/**
 * @type {IOnErrorActions}
 */
const ON_ERROR = {
	timer: new Cooldown(5),
	codes: {
		ECONNRESET: () => noConnection("Err CONNECTION RESET"),
		ERR_MODULE_NOT_FOUND: (err) => {
			Service.error(err);
		},
		400: (err) => {
			if (err?.response?.description?.includes("not enough rights")) {
				bot.telegram.sendMessage(
					err.on.payload.chat_id,
					`У бота нет разрешений для выполнения действия "${err.on.method}"`
				);
			} else Service.error(err);
		},
		429: (err) => {
			if (ON_ERROR.timer.isExpired()) console.warn(err.stack);
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
	const code_action = ON_ERROR.codes[err?.response?.error_code];
	const type_action = ON_ERROR.types[err?.name];

	if (type_action) {
		type_action(err);
	} else if (code_action) {
		code_action(err);
	} else Service.error(err);

	Service.errors[err?.name] = Service.errors[err?.name] ?? [];
	Service.errors[err?.name].push(err);
}

/**
 *
 * @param {Error & {code: string; stack: string}} err
 * @returns
 */
export async function handleBotError(err) {
	if (err && err.name === "FetchError")
		noConnection(styles.highlight("Telegraf"));
	else Service.error(err);
}

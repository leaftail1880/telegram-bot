import { bot, Service } from "../../index.js";
import styles from "../styles.js";
import { Cooldown } from "../utils/cooldown.js";
import { noConnection } from "./error.js";

/**
 * @type {{
 *   timer: import("../utils/cooldown.js").Cooldown;
 *   codes: Record<string | number, (err?: RealError) => void>;
 *   types: Record<string, (err: RealError) => void>;
 * }}
 */
const onError = {
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
			if (onError.timer.isExpired()) console.warn(err.stack);
		},
	},
	types: {
		FetchError: () => noConnection("Unhandled FetchError"),
	},
};

/**
 * @param {RealError} err
 */
export async function handleError(err) {
	const onCodeAction = onError.codes[err?.response?.error_code];
	const onTypeAction = onError.types[err?.name];

	if (onTypeAction) {
		onTypeAction(err);
	} else if (onCodeAction) {
		onCodeAction(err);
	} else Service.error(err);

	Service.errors[err?.name] = Service.errors[err?.name] ?? [];
	Service.errors[err?.name].push(err);
}

/**
 * @param {Error & {code: string; stack: string}} err
 */
export async function handleBotError(err) {
	if (err && err.name === "FetchError")
		noConnection(styles.highlight("Telegraf"));
	else Service.error(err);
}

import { database } from "../../index.js";
import { bot } from "../launch/tg.js";
import { data, SERVISE } from "../SERVISE.js";

/**
 * @type {import("./typess.js").IOnErrorActions}
 */
const onError = {
	cache: {
		lastTime: Date.now(),
		type: "none",
		cooldown: 1000,
	},
	codes: {
		ECONNRESET: () => {
			if (Date.now() - onError.cache.lastTime <= onError.cache.cooldown * 10 && onError.cache.type === "ECONNRESET")
				return;
			onError.cache.type = "ECONNRESET";
			onError.cache.lastTime = Date.now();
			console.log("Нет подключения к интернету");
		},
		ERR_MODULE_NOT_FOUND: (err) => {
			SERVISE.error(err);
		},
		409: () => SERVISE.freeze(),
		400: (err) => {
			if (err?.response?.description?.includes("not enough rights")) {
				bot.telegram.sendMessage(
					err.on.payload.chat_id,
					'У бота нет разрешений для выполнения действия "' + err.on.method + '"'
				);
				return;
			}
			SERVISE.error(err);
		},
		429: (err) => {
			if (Date.now() - onError.cache.lastTime <= onError.cache.cooldown && onError.cache.type === err.stack) return;
			onError.cache.type = err.stack;
			onError.cache.lastTime = Date.now();
			console.warn(err.stack);
		},
		413: (err) => {
			console.warn(err);
		},
	},
	types: {},
};

/**
 * @param {import("./typess.js").IhandledError} err
 */
export async function handleError(err) {
	const code_action = onError.codes[err?.response?.error_code];
	const type_action = onError;
	if (code_action) {
		code_action(err);
	} else SERVISE.error(err);

	data.errorLog[err?.name] = data.errorLog[err?.name] ?? [];
	data.errorLog[err?.name].push(err);
}

/**
 *
 * @param {Error & {code: string}} err
 * @returns
 */
export async function handleDB(err) {
	if (err.message == "Client IP address is not in the allowlist.") {
		await SERVISE.stop("Put your ip addres to db allowlist", "ALL");
		return;
	}
	if (err.code == "ENOTFOUND") {
		return onError.codes.ECONNRESET();
	}
	if (err.message == "Socket closed unexpectedly") {
		await database.client.connect();
		return;
	}
	SERVISE.error({
		name: "◔ " + err.name,
		message: err.message,
		stack: err.stack,
	});
}

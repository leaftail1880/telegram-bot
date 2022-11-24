import { database } from "../../index.js";
import { bot } from "../launch/tg.js";
import { data, SERVISE } from "../SERVISE.js";

const OnErrorActions = {
	cache: {
		lastTime: Date.now(),
		type: "none",
		cooldown: 1000,
	},
	codes: {
		ECONNRESET: () => {
			if (
				Date.now() - OnErrorActions.cache.lastTime <= OnErrorActions.cache.cooldown * 10 &&
				OnErrorActions.cache.type === "ECONNRESET"
			)
				return;
			OnErrorActions.cache.type = "ECONNRESET";
			OnErrorActions.cache.lastTime = Date.now();
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
			if (
				Date.now() - OnErrorActions.cache.lastTime <= OnErrorActions.cache.cooldown &&
				OnErrorActions.cache.type === err.stack
			)
				return;
			OnErrorActions.cache.type = err.stack;
			OnErrorActions.cache.lastTime = Date.now();
			console.warn(err.stack);
		},
		413: (err) => {
			console.warn(err);
		},
	},
};

export async function handleError(err) {
	if (OnErrorActions.codes[err?.response?.error_code]) {
		OnErrorActions.codes[err?.response?.error_code](err);
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
		return OnErrorActions.codes.ECONNRESET();
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

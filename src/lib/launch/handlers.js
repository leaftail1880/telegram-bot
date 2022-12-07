import clc from "cli-color";
import { database } from "../../index.js";
import { XTimer } from "../Class/XTimer.js";
import { data, SERVISE } from "../SERVISE.js";
import { bot } from "./tg.js";

const connectionLog = {
	ErrorCooldown: 5,
	ReconnectTimerWaitTime: 5,
	async timer() {
		try {
			await database._.connect(null, Date.now());
			await new Promise((r) => setTimeout(r, 100));
			await bot.launch();
			console.log(clc.greenBright("Подключение восстановлено"));
			data.isStopped = false;
		} catch (e) {}
	},
	openReconnectTimer() {
		setTimeout(connectionLog.timer, connectionLog.ReconnectTimerWaitTime * 1000);
	},
};

const connectionTimer = new XTimer(connectionLog.ErrorCooldown);
/**
 *
 * @param {string} [type]
 * @returns
 */
function noConnection(type) {
	if (data.isLaunched && !data.isStopped) {
		bot.stop("NOCONNECTION");
		data.isStopped = true;
	}
	if (!database.isClosed) database._.close(false);

	if (connectionTimer.isExpired()) {
		console.log(clc.redBright(`Нет подключения к интернету ${type ? `[${type}]` : ""}`));
		connectionLog.openReconnectTimer();
	}
}

/**
 * @type {IOnErrorActions}
 */
const OnError = {
	timer: new XTimer(5),
	codes: {
		ECONNRESET: () => noConnection("Err CONNECTION RESET"),
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
			if (OnError.timer.isExpired()) console.warn(err.stack);
		},
		413: (err) => {
			SERVISE.error(err);
		},
	},
	types: {
		FetchError: () => noConnection(clc.red("Unhandled FetchError")),
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
	if (err.message === "Client IP address is not in the allowlist.") {
		await SERVISE.stop(clc.red("Put your ip addres to db allowlist"), "ALL", false);
		return;
	}
	if (err.message === "Socket closed unexpectedly") {
		await database._.connect();
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
	else SERVISE.error(err);
}

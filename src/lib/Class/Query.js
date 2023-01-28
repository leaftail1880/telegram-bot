import clc from "cli-color";
import { bot, newlog } from "../../index.js";
import { safeRun } from "../utils/safe.js";
import { on } from "./Events.js";
import { u, util } from "./Utils.js";
import { XTimer } from "./XTimer.js";

export class Query {
	/**
	 * @type {Record<string, Query>}
	 */
	static queries = {};
	/**
	 * Создает команду
	 * @param {Object} info
	 * @param {string} info.name Имя
	 * @param {string} info.prefix Без ::
	 * @param {string} [info.message] Сообщение при нажатии (оставьте пустым если не надо)
	 * @param {number} [info.permisson]
	 * @param {QueryCallback} callback
	 */
	constructor(info, callback) {
		if (!info?.name) return;

		this.info = {
			name: info.name,
			prefix: info.prefix,
			message: info.message,
			perm: info.permisson ?? 0,
		};
		this.callback = callback;

		Query.queries[`${info.prefix}${u.separator.link}${info.name}`] = this;
	}
	/**
	 *
	 * @param {Context} ctx
	 * @param {string} message
	 */
	static Log(ctx, message = null) {
		const name = util.getName(null, ctx.from);
		const text = `${name}: ${message}`;
		newlog({
			consoleMessage: clc.blackBright("Q> ") + text,
			fileMessage: text,
		});
	}
}

/**
 * @param {string} data
 */
function parseQueryData(data) {
	const unparsed = data.split(u.separator.linkToData);
	const escaper = Date.now().toString(16);
	const args = unparsed[1]
		? unparsed[1]
				.replaceAll("\\" + u.separator.link, escaper)
				.split(u.separator.data)
				.map((e) => e.replace(escaper, u.separator.link))
		: [];
	return { query: Query.queries[unparsed[0]], args };
}

/**
 *
 * @param {Context} ctx
 * @returns {ctx is Context & { callbackQuery: import("telegraf/types").CallbackQuery.DataQuery }}
 */
function isQuery(ctx) {
	return "data" in ctx.callbackQuery;
}

const Qtimer = new XTimer(0.3, true);

on("modules.load", () => {
	bot.on("callback_query", async (ctx, next) => {
		if (!isQuery(ctx)) return;
		const data = ctx.callbackQuery.data;
		if (!Qtimer.isExpired(data)) return;

		const { query, args } = parseQueryData(data);
		if (!query) {
			ctx.answerCbQuery("Ошибка 400: Обработчик кнопки не найден. Возможно, вы нажали на старую кнопку.", {
				show_alert: true,
			});
			Query.Log(ctx, "No button parser for: " + data);
			return next();
		}

		Query.Log(ctx, `${query.info.prefix} ${query.info.name}: ${args.map((e) => `'${e}'`).join(" ")}`);
		await safeRun("Q", () => query.callback(ctx, args, (text, extra) => ctx.editMessageText(text, extra)));
		if (query.info.message) ctx.answerCbQuery(query.info.message);
	});
});

new Query(
	{
		name: "delmsg",
		prefix: "all",
		message: "Выход...",
	},
	(ctx) => {
		ctx.deleteMessage(ctx.callbackQuery.message.message_id);
		ctx.deleteMessage(ctx.callbackQuery.message.message_id);
	}
);

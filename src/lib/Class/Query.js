import clc from "cli-color";
import { bot, newlog } from "../../index.js";
import { safeRun } from "../utils/safe.js";
import { on } from "./Events.js";
import { editMsg } from "./Menu.js";
import { u, util } from "./Utils.js";
import { XTimer } from "./XTimer.js";

/**
 * @type {Object<string, Query>}
 */
const ques = {};
export class Query {
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

		// Регистрация инфы
		this.info = {
			name: info.name,
			msg: info.message,
			perm: info.permisson ?? 0,
		};
		this.callback = callback;

		ques[`${info.prefix}${u.separator.link}${info.name}`] = this;
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
 *
 * @param {string} data
 * @returns {{Qname: string; args: string[]}}
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
	return { Qname: unparsed[0], args };
}

const Qtimer = new XTimer(0.3, true);
on("modules.load", () => {
	bot.on("callback_query", async (ctx, next) => {
		if (!("data" in ctx.callbackQuery)) return;
		const data = ctx.callbackQuery.data;
		if (!Qtimer.isExpired(data)) return;

		const { Qname, args } = parseQueryData(data);
		const q = ques[Qname];
		if (!q) {
			ctx.answerCbQuery("Ошибка 400: Обработчик кнопки не найден. Возможно, вы нажали на старую кнопку.", {
				show_alert: true,
			});
			Query.Log(ctx, "No button parser for: " + data);
			return next();
		}

		Query.Log(ctx, `${Qname} ${args.join("  ")}`);
		await safeRun("Q", () =>
			q.callback(ctx, args, (text, extra) => editMsg(ctx, ctx.callbackQuery.message, text, extra))
		);
		if (q.info.msg) ctx.answerCbQuery(q.info.msg);
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

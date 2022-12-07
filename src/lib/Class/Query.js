import { database } from "../../index.js";
import { bot } from "../launch/tg.js";
import { data as $data, log } from "../SERVISE.js";
import { safeRun } from "../utils/safeRun.js";
import { EventListener } from "./Events.js";
import { editMsg } from "./Menu.js";
import { d, util } from "./Utils.js";
import { Xitext } from "./Xitext.js";
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
	 * @param {QueryTypes.Callback} callback
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

		ques[`${info.prefix}${d.separator.link}${info.name}`] = this;
	}
}

/**
 *
 * @param {string} data
 * @returns {{Qname: string; args: string[]}}
 */
function parseQueryData(data) {
	const unparsed = data.split(d.separator.linkToData);
	const escaper = Date.now().toString(16);
	const args = unparsed[1]
		? unparsed[1]
				.replaceAll("\\" + d.separator.link, escaper)
				.split(d.separator.data)
				.map((e) => e.replace(escaper, d.separator.link))
		: [];
	return { Qname: unparsed[0], args };
}

const Qtimer = new XTimer(0.5, true);

function loadQuerys() {
	bot.on("callback_query", async (ctx, next) => {
		const data = ctx.callbackQuery.data;
		if (!Qtimer.isExpired(data)) return;

		const { Qname, args } = parseQueryData(data);
		const q = ques[Qname];
		if (!q) {
			ctx.answerCbQuery("Ошибка 400!\nОбработчик кнопки не найден. Возможно, вы нажали на старую кнопку.", {
				show_alert: true,
			});
			log("Cannot find parser for " + data);
			return next();
		}

		const name = util.getFullName(
			database.cache.tryget(d.user(ctx.callbackQuery.from.id), 2 ** 32),
			ctx.callbackQuery.from
		);

		const xt = new Xitext()._.group(name)
			.bold()
			.url(null, ctx.from.id !== $data.chatID.owner ? d.userLink(ctx.from.id) : `https://t.me/${ctx.from.username}`)
			._.group()
			.text(": ")
			.bold(Qname);

		args.forEach((e) => xt.text("\n  ").mono(e));

		const run = () => q.callback(ctx, args, (text, extra) => editMsg(ctx, ctx.callbackQuery.message, text, extra));

		safeRun("Q", run, xt, xt);
		if (q.info.msg) ctx.answerCbQuery(q.info.msg);
	});
}

new Query(
	{
		name: "delmsg",
		prefix: "all",
		message: "Выход...",
	},
	(ctx) => {
		ctx.deleteMessage(ctx.callbackQuery.message.message_id);
	}
);

new EventListener("modules.load", 0, loadQuerys);

import chalk from "chalk";
import { Service, bot, callbackQuery } from "../index.js";
import { Cooldown } from "./utils/cooldown.js";
import { u, util } from "./utils/index.js";
import { MultiLogger } from "./utils/logger.js";

export class Query {
	static Logger = new MultiLogger();
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
	static Log(ctx, message) {
		const name = util.getName(null, ctx.from);
		const text = `${name}: ${message}`;
		this.Logger.log({
			consoleMessage: chalk.blackBright("Q> ") + text,
			fileMessage: text,
		});
	}
	/**
	 * @param {string} data
	 */
	static parseQueryData(data) {
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
}

const Q_TIMER = new Cooldown(0.3, true);

process.on("modulesLoad", () => {
	bot.on(callbackQuery("data"), async (ctx, next) => {
		const data = ctx.callbackQuery.data;
		if (!Q_TIMER.isExpired(data)) return;

		const { query, args } = Query.parseQueryData(data);
		if (!query) {
			ctx.answerCbQuery(
				"Ошибка 400: Обработчик кнопки не найден. Возможно, вы нажали на старую кнопку.",
				{
					show_alert: true,
				}
			);
			Query.Log(ctx, "No button parser for: " + data);
			return next();
		}

		Query.Log(
			ctx,
			`${query.info.prefix} ${query.info.name}: ${args
				.map((e) => `'${e}'`)
				.join(" ")}`
		);

		try {
			await query.callback(ctx, args, ctx.editMessageText.bind(ctx));
		} catch (error) {
			Service.error({
				name: `QueryError: `,
				message: error.message,
				stack: error.stack,
			});
		}
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
		ctx.deleteMessage(ctx.callbackQuery.message.message_id)
	}
);

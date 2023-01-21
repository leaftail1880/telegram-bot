import { Context } from "telegraf";
import { Query } from "./Query.js";
import { d } from "./Utils.js";
import { Button, CreateNamespacedButton } from "./Xitext.js";

export class MultiMenu {
	static get config() {
		return {
			maxRows: 12,
			maxButtonsPerRow: 6,
			backButtonSymbol: "↩️",
			pageBack: "«",
			pageNext: "»",
		};
	}
	/**
	 *
	 * @param {string} prefix
	 */
	constructor(prefix) {
		this.prefix = prefix;
		this.config = MultiMenu.config;
	}
	/**
	 *
	 * @param {Context} ctx
	 * @param {string} text
	 * @param {import("telegraf/types").Convenience.ExtraEditMessageText} [extra]
	 * @param {Array<Array<import("telegraf/types").InlineKeyboardButton>>} [InlineKeyboard]
	 */
	editMsgFromQuery(ctx, text, extra, InlineKeyboard) {
		return editMsg(ctx, ctx.callbackQuery.message, text, extra, InlineKeyboard);
	}
	/**
	 *
	 * @param {string} methodName
	 * @param  {...any} args
	 * @returns {string}
	 */
	link(methodName, ...args) {
		return d.query(this.prefix, methodName, ...args);
	}
	/**
	 *
	 * @param {DB.User} user
	 * @param {number} lvl
	 * @returns
	 */
	isCacheEmpty(user, lvl = 0) {
		return !user?.cache?.sceneCache?.map || !user?.cache?.sceneCache[lvl];
	}
	/**
	 *
	 * @param {Object} options
	 * @param {import("telegraf/types").InlineKeyboardButton[][]} options.buttons
	 * @param {string} options.queryName
	 * @param {import("telegraf/types").InlineKeyboardButton} [options.backButton]
	 * @param {string | number} [options.pageTo]
	 * @param {number} [options.buttonLimit]
	 * @returns
	 */
	generatePageSwitcher({ buttons, queryName, backButton = null, pageTo = 1, buttonLimit = this.config.maxRows }) {
		const page = Number(pageTo);
		const qNext = Math.ceil(buttons.length / buttonLimit) - 1 >= page;
		const qBack = page > 1;

		const start = buttonLimit * page - buttonLimit;
		const end = buttonLimit * page;

		const btns = buttons.slice(start, end);
		const menu = [];

		if (backButton) menu.push(backButton);

		if (qBack) menu.unshift(Button(this.config.pageBack, this.link(queryName, page - 1)));
		if (qNext) menu.push(Button(this.config.pageNext, this.link(queryName, page + 1)));

		btns.push(menu);

		return btns;
	}
	/**
	 * Создает команду
	 * @param {Object} info
	 * @param {string} info.name Имя
	 * @param {string} [info.message] Сообщение при нажатии (оставьте пустым если не надо)
	 * @param {number} [info.permisson]
	 * @param {QueryCallback} callback
	 */
	query(info, callback) {
		return new Query({ prefix: this.prefix, ...info }, callback);
	}
	createButtonMaker() {
		return CreateNamespacedButton(this.prefix);
	}
}

export async function editMsg(ctx, message, text, extra, InlineKeyboard) {
	if (text > 4020) return;
	if (typeof extra === "object" && InlineKeyboard) extra.reply_markup.inline_keyboard = InlineKeyboard;
	await ctx.telegram.editMessageText(message.chat.id, message.message_id, null, text, extra);
}

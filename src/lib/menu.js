import { Query } from "./query.js";
import { u } from "./utils/index.js";

export class MultiMenu {
	config = {
		maxRows: 6,
		maxButtonsPerRow: 6,
		backButtonSymbol: "↩️",
		pageBack: "«",
		pageNext: "»",
	};

	/**
	 * @param {string} prefix
	 */
	constructor(prefix) {
		this.prefix = prefix;
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
	generatePageSwitcher({
		buttons: allButtons,
		queryName,
		backButton = null,
		pageTo = 1,
		buttonLimit = this.config.maxRows,
	}) {
		const page = Number(pageTo);
		const qNext = Math.ceil(allButtons.length / buttonLimit) - 1 >= page;
		const qBack = page > 1;

		const start = buttonLimit * page - buttonLimit;
		const end = buttonLimit * page;

		const buttons = allButtons.slice(start, end);
		const switchPageMenu = [];

		if (qBack) {
			switchPageMenu.push(
				u.btn(this.config.pageBack, this.prefix, queryName, page - 1)
			);
		}
		if (backButton) {
			switchPageMenu.push(backButton);
		}
		if (qNext) {
			switchPageMenu.push(
				u.btn(this.config.pageNext, this.prefix, queryName, page + 1)
			);
		}

		buttons.push(switchPageMenu);

		return buttons;
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

	buttonMaker() {
		return (
			/**
			 * @type {StringLike}
			 */ text,
			/**
			 * @type {StringLike}
			 */ method,
			/**
			 * @type {StringLike[]}
			 */ ...args
		) => u.btn(text, this.prefix, method, ...args);
	}
}

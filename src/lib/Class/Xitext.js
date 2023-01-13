export class Button {
	/**
	 * @type {Object}
	 */
	#button;
	/**
	 *
	 * @param {string} text
	 */
	constructor(text) {
		this.#button = {};
		this.#button.text = text;
	}
	/**
	 *
	 * @param {string} url
	 * @returns {import("telegraf/types").InlineKeyboardButton.UrlButton}
	 */
	url(url) {
		if (url) this.#button.url = url;
		return this.#button;
	}
	/**
	 *
	 * @param {string} data
	 * @returns {import("telegraf/types").InlineKeyboardButton.CallbackButton}
	 */
	data(data) {
		if (data) this.#button.callback_data = data;
		return this.#button;
	}
	/**
	 *
	 * @param {string} e
	 * @returns {import("telegraf/types").InlineKeyboardButton.CallbackButton}
	 */
	switchInline(e) {
		if (e) this.#button.switch_inline_query_current_chat = e;
		return this.#button;
	}
}

/**
 * @typedef {(text?: string) => Xitext} Xgroup
 */

/**
 * @typedef {(extra?: import("telegraf/types").Convenience.ExtraReplyMessage, move?: number) => [string, import("telegraf/types").Convenience.ExtraReplyMessage]} Xbuild
 */

export class Xitext {
	/**
	 * @type {{group: Xgroup; build: Xbuild; text: string; entities: Array<import("telegraf/types").MessageEntity>;}}
	 */
	_ = {
		group: this.#group.bind(this),
		build: this.#build.bind(this),
		text: "",
		entities: [],
	};
	__ = {
		group: false,
		previous: null,
		offset: 0,
		/**
		 * @type {import("telegraf/types").InlineKeyboardButton[][]}
		 */
		inlineKeyboard: [],
	};
	constructor() {}
	/**
	 *
	 * @param {string} text
	 * @param {Object} obj
	 * @returns
	 */
	#entity(text, obj) {
		let t = !this.__.group ? `${text}` : this.__.previous;
		if (!t) return this;
		/**
		 * @type {import("telegraf/types").MessageEntity}
		 */
		const ent = {
			length: t.length,
			offset: this.__.offset,
			...obj,
		};
		this._.entities.push(ent);
		if (!this.__.group) {
			this.__.offset += ent.length;
			this._.text += t;
		}
		return this;
	}
	get endgroup() {
		if (this.__.group) {
			this.__.group = false;
			this.__.offset = this.__.offset + this.__.previous.length ?? 0;
		}
		return this;
	}
	/**
	 *
	 * @param {string} [text]
	 * @returns {this}
	 */
	#group(text) {
		if (!text && this.__.group) {
			this.__.group = false;
			this.__.offset = this.__.offset + this.__.previous.length ?? 0;
			this.__.previous = null;
		} else if (text) {
			this.__.group = true;
			const t = `${text}`;
			this.__.previous = t;
			this._.text += t;
		}
		return this;
	}
	text(text) {
		let t = `${text}`;
		this.__.offset = this.__.offset + t.length;
		this._.text += t;
		return this;
	}

	bold(text) {
		return this.#entity(text, {
			type: "bold",
		});
	}
	italic(text) {
		const ent = {
			type: "italic",
		};

		return this.#entity(text, ent);
	}
	underline(text) {
		const ent = {
			type: "underline",
		};

		return this.#entity(text, ent);
	}
	strike(text) {
		const ent = {
			type: "strikethrough",
		};

		return this.#entity(text, ent);
	}
	spoiler(text) {
		const ent = {
			type: "spoiler",
		};

		return this.#entity(text, ent);
	}
	url(text, url) {
		if (!url) return this;
		const ent = {
			type: "text_link",
			url: url,
		};

		return this.#entity(text, ent);
	}
	mention(text, User) {
		if (!User) return this;
		const ent = {
			type: "text_mention",
			user: User,
		};

		return this.#entity(text, ent);
	}
	mono(text) {
		const ent = {
			type: "code",
		};

		return this.#entity(text, ent);
	}
	code(text, language = "JavaScript") {
		if (!language) return this;
		const ent = {
			type: "pre",
			language: language,
		};

		return this.#entity(text, ent);
	}
	/**
	 *
	 * @param  {...Array<import("telegraf/types").InlineKeyboardButton>} lines
	 */
	inlineKeyboard(...lines) {
		this.__.inlineKeyboard = lines;
		return this;
	}
	/**
	 *
	 * @param {import("telegraf/types").Convenience.ExtraReplyMessage} extra
	 * @returns {[string, import("telegraf/types").Convenience.ExtraReplyMessage]}
	 */
	#build(extra = {}, move = 0) {
		/**
		 * @type {import("telegraf/types").Convenience.ExtraReplyMessage}
		 */
		const EXTRA = Object.assign(extra);
		if (move !== 0) {
			this._.entities.forEach((e) => (e.offset += move));
		}
		if (!EXTRA.disable_web_page_preview) {
			EXTRA.disable_web_page_preview = true;
		}
		if (this._.entities.length > 0) EXTRA.entities = this._.entities;
		if (Array.isArray(this.__.inlineKeyboard[0])) {
			if (typeof EXTRA.reply_markup !== "object")
				EXTRA.reply_markup = {
					inline_keyboard: this.__.inlineKeyboard,
				};
		}
		return [this._.text ?? "empty Xitext()", EXTRA];
	}
}

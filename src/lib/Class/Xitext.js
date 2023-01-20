import { TypedBind } from "leafy-utils";

/**
 *
 * @param {StringLike} text
 * @param {StringLike} data
 * @returns {import("telegraf/types").InlineKeyboardButton.CallbackButton}
 */
export function Button(text, data) {
	text = text + "";
	data = data + "";
	return {
		text,
		callback_data: data,
	};
}

/**
 * @typedef {string | number | boolean} StringLike
 */

export class Xitext {
	_ = {
		group: TypedBind(this.group),
		build: TypedBind(this.build),
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
	/**
	 * Creates a new entity
	 * @param {StringLike} text
	 * @param {Optional<import("telegraf/types").MessageEntity>} obj
	 * @private
	 */
	entity(text, obj) {
		let t = !this.__.group ? `${text}` : this.__.previous;
		if (!t) return this;
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
	/**
	 * Enables group fromatting
	 * @param {string} [text]
	 * @private
	 */
	group(text) {
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
	get endgroup() {
		if (this.__.group) {
			this.__.group = false;
			this.__.offset = this.__.offset + this.__.previous.length ?? 0;
		}
		return this;
	}
	/**
	 * Writes to end of Xitext with given style
	 * @param {StringLike} text Text to write
	 */
	text(text) {
		let t = `${text}`;
		this.__.offset = this.__.offset + t.length;
		this._.text += t;
		return this;
	}
	/**
	 * Writes to end of Xitext with given style
	 * @param {StringLike} [text] Text to write
	 */
	bold(text) {
		return this.entity(text, {
			type: "bold",
		});
	}
	/**
	 * Writes to end of Xitext with given style
	 * @param {StringLike} [text] Text to write
	 */
	italic(text) {
		return this.entity(text, {
			type: "italic",
		});
	}
	/**
	 * Writes to end of Xitext with given style
	 * @param {StringLike} [text] Text to write
	 */
	underline(text) {
		return this.entity(text, {
			type: "underline",
		});
	}
	/**
	 * Writes to end of Xitext with given style
	 * @param {StringLike} [text] Text to write
	 */
	strike(text) {
		return this.entity(text, {
			type: "strikethrough",
		});
	}
	/**
	 * Writes to end of Xitext with given style
	 * @param {StringLike} [text] Text to write
	 */
	spoiler(text) {
		return this.entity(text, {
			type: "spoiler",
		});
	}
	/**
	 * Writes to end of Xitext with given style
	 * @param {StringLike} text Text to write
	 * @param {string} url Url
	 */
	url(text = null, url) {
		if (!url) return this;
		return this.entity(text, {
			type: "text_link",
			url: url,
		});
	}
	/**
	 * Writes to end of Xitext with given style
	 * @param {StringLike} text Text to write
	 * @param {import("telegraf/types").User} User
	 */
	mention(text = null, User) {
		if (!User) return this;
		return this.entity(text, {
			type: "text_mention",
			user: User,
		});
	}
	/**
	 * Writes to end of Xitext with given style
	 * @param {StringLike} [text] Text to write
	 */
	mono(text) {
		return this.entity(text, {
			type: "code",
		});
	}
	/**
	 * Writes to end of Xitext with given style
	 * @param {StringLike} [text] Text to write
	 */
	code(text, language = "js") {
		if (!language) return this;
		return this.entity(text, {
			type: "pre",
			language: language,
		});
	}
	/**
	 * Sets inline keyboard for this Xitext
	 * @param  {...Array<import("telegraf/types").InlineKeyboardButton>} lines
	 */
	inlineKeyboard(...lines) {
		this.__.inlineKeyboard = lines;
		return this;
	}
	/**
	 * Builds this Xitext
	 * @param {import("telegraf/types").Convenience.ExtraReplyMessage} EXTRA
	 * @returns {[string, import("telegraf/types").Convenience.ExtraReplyMessage]}
	 * @private
	 */
	build(EXTRA = {}, move = 0) {
		if (move !== 0) {
			this._.entities.forEach((e) => (e.offset += move));
		}

		if (!("disable_web_page_preview" in EXTRA)) {
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

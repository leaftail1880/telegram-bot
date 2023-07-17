import node_utils from "util";
import { tables } from "../launch/db.js";

export const util = {
	/**
	 * Safly gets key from object **and triggers** [[Get]] listener
	 * @template {object} S
	 * @param {S} source
	 * @param {keyof S | string} key
	 * @returns {any}
	 */
	get(source, key) {
		if (!(source && typeof source === "object" && key in source)) return;
		// @ts-expect-error We already used in statement to check this.
		return source[key];
	},
	/**
	 * @param {{
	 *   reply(s: string | ReturnType<import("./Xitext.js").fmt>, extra: import("telegraf/types").Convenience.ExtraReplyMessage): any;
	 *   message: { message_id: number; reply_to_message?: {message_id?: number}}
	 * }} ctx
	 * @param {'reply' | 'direct'} prefer
	 */
	makeReply(ctx, prefer = "reply") {
		/**
		 * Replies
		 * @param {Text} text
		 * @param {'reply' | 'direct'} more_prefer
		 * @returns
		 */
		function repl(text, more_prefer = "reply") {
			return ctx.reply(text, {
				allow_sending_without_reply: true,
				reply_to_message_id:
					(more_prefer ?? prefer) === "reply"
						? ctx.message?.reply_to_message?.message_id ?? ctx.message.message_id
						: ctx.message.message_id,
				disable_web_page_preview: true,
			});
		}
		return repl;
	},
	/**
	 * @param {any} obj
	 * @returns {string}
	 */
	inspect(obj) {
		return node_utils.inspect(obj, { depth: 10 });
	},

	/**
	 * Only user first_name, username, id and last_name if string is less then 10 characters length
	 * @param {import("telegraf/types").User} user
	 */
	getTelegramName(user) {
		let name = String(user.first_name ?? user.username ?? user.id);

		if (user.last_name && name.length + user.last_name.length < 10) name += user.last_name;

		return name;
	},

	/**
	 * Gets name from db or from user if no db name found
	 * @param {DB.User | null} [dbuser]
	 * @param {import("telegraf/types").User | null} [user]
	 * @param {number | string} [id]
	 */
	getName(dbuser, user, id) {
		if (!dbuser) dbuser = tables.users.get(user?.id ?? id);
		let name = dbuser?.cache?.nickname ?? dbuser?.static?.name ?? dbuser?.static?.nickname;

		if (!name && user) name = util.getTelegramName(user);
		return name;
	},
	/**
	 *
	 * @param {string} msg
	 * @param {(s: string) => Promise<unknown> | unknown} method
	 */
	async sendSeparatedMessage(msg, method, limit = 4000, safeCount = 5) {
		if (msg.length < limit) return method(msg);

		for (let p = 1; p <= Math.ceil(msg.length / limit) && p <= safeCount; p++) {
			await method(msg.substring(p * limit - limit, p * limit));
		}
	},
	/**
	 *
	 * @param {string} digit
	 * @param {[string, string, string]} _ 1 секунда 2 секунды 5 секунд
	 * @returns
	 */
	toTimeLocale(digit, [one = "секунда", few = "секунды", more = "секунд"]) {
		const lastDigit = digit[digit.length - 1];

		let o = more;
		if (lastDigit === "1" && !digit.endsWith("11")) {
			o = one;
		} else if (["1", "2", "3", "4"].includes(lastDigit)) {
			o = few;
		}
		return o;
	},
	/**
	 *
	 * @param {number} ms Milliseconds to parse
	 */
	toRemainingTime(ms) {
		let parsedTime = "0";
		let type = "ошибок";

		/**
		 * @param {number} value
		 * @param {[string, string, string]} valueType 1 секунда 2 секунды 5 секунд
		 */
		const set = (value, valueType, fiction = 0) => {
			if (parsedTime === "0" && ~~value > 1 && value < 100) {
				// Replace all 234.0 values to 234
				parsedTime = value
					.toFixed(fiction)
					.replace(/(\.[1-9]*)0+$/m, "$1")
					.replace(/\.$/m, "");

				type = this.toTimeLocale(parsedTime, valueType);
			}
		};

		set(ms / (1000 * 60 * 60 * 60 * 24), ["день", "дня", "дней"], 2);
		set(ms / (1000 * 60 * 60), ["час", "часа", "часов"], 1);
		set(ms / (1000 * 60), ["минуту", "минуты", "минут"], 1);
		set(ms / 1000, ["секунда", "секунды", "секунд"]);

		return { parsedTime, type };
	},
};

// type StringLike = number | string

export const u = {
	/**
	 * Creates ```${prefix}::${name}``` string
	 * @param {StringLike} prefix
	 * @param {StringLike} name
	 */
	pn: (prefix, name) => `${prefix}::${name}`,
	/**
	 * Creates link to guide group
	 * @param {number} index
	 */
	guide: (index) => `https://t.me/xillerbotguides/${index}`,
	/**
	 * Creates ```tg://user?id=id``` like link
	 * @param {number} id
	 */
	userLink: (id) => `tg://user?id=${id}`,
	/**
	 * Creates ```https://t.me/nickname``` like link
	 * @param {string} nickname
	 */
	httpsUserLink: (nickname) => `https://t.me/${nickname}`,

	/**
	 * It's a function that joins an array with a separator,
	 * but it escapes the separator in the array elements.
	 * @param {StringLike[]} arr - The array to join
	 * @param {string} separator - Separator to be escaped
	 */
	safeJoin(arr, separator) {
		return arr
			.map(String)
			.map((e) => e.replaceAll(separator, "\\" + separator))
			.join(separator);
	},
	/**
	 * Returns the array's elements joined together with
	 * commas and an "and" between the last two elements
	 * @param {StringLike[]} arr - The array to join.
	 */
	langJoin(arr) {
		return arr
			.map((v, i, a) => {
				if (i === 0) return v;
				return `${i === a.length - 1 ? " и " : ", "}${v}`;
			})
			.join("");
	},

	/**
	 * Query link
	 * @param {StringLike} prefix
	 * @param {StringLike} name
	 * @param  {...StringLike} args
	 */
	query: (prefix, name, ...args) =>
		`${prefix}${u.separator.link}${name}${
			args ? `${u.separator.linkToData}${u.safeJoin(args, u.separator.data)}` : ""
		}`,

	separator: {
		link: ".",
		linkToData: "/",
		data: ",",
	},
};

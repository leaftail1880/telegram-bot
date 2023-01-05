import { database } from "../../index.js";

export const util = {
	/**
	 * @param {any} target
	 * @returns {string}
	 */
	toStr(target, space = "  ", cw = "", funcCode = false, depth = 0) {
		if (depth > 10 || typeof target !== "object") return `${rep(target)}` ?? `${target}` ?? "{}";

		/**
		 * @param {any} value
		 */
		function rep(value) {
			switch (typeof value) {
				case "function":
					/**
					 * @type {string}
					 */
					let r = value.toString().replace(/[\n\r]/g, "");

					if (!funcCode) {
						const native = r.includes("[native code]");
						const code = native ? " [native code] " : "...";
						let isArrow = true;
						let name = "";

						if (r.startsWith("function")) {
							r = r.replace(/^function\s*/, "");
							isArrow = false;
						}

						if (/\w*\(/.test(r)) {
							name = r.match(/(\w*)\(/)[1];
							r = r.replace(name, "");
						}

						let args = "(",
							bracket = false,
							escape = false;

						for (const [i, char] of r.split("").entries()) {
							if (char === '"' && !escape) {
								bracket = !bracket;
							}

							if (char === "\\") {
								escape = true;
							} else escape = false;

							if (!bracket && char === ")") {
								args = r.substring(0, i);
								break;
							}
						}
						// function
						r = `${isArrow ? "" : `function `}`;
						r += `${name}`;
						r += `${args})`;
						r += `${isArrow ? " => " : " "}`;
						r += `{${code}}`;
					}

					value = r;

					break;

				case "object":
					if (Array.isArray(value)) break;

					if (visited.has(value)) {
						// Circular structure detected
						value = "{...}";
						break;
					}

					try {
						visited.add(value);
					} catch (e) {}

					const allInherits = {};

					for (const key in value)
						try {
							// value[key] can be ungettable
							allInherits[key] = value[key];
						} catch (e) {}

					value = allInherits;
					break;
				case "symbol":
					value = `[Symbol.${value.description}]§r`;
					break;

				case "string":
					value = `'${value}'`;
					break;
			}
			return value;
		}

		// avoid Circular structure error
		const visited = new WeakSet();

		return JSON.stringify(target, (_, value) => rep(value), space)?.replace(/"/g, cw);
	},
	/**
	 *
	 * @param {number | string} hours
	 * @param {string} left1 остался
	 * @param {string} left2 осталось
	 * @param {string} left3 осталось
	 * @returns {string}
	 */
	toHrsString(hours, left1, left2, left3) {
		const hrs = `${hours}`;
		let o;
		if (hrs.endsWith("1") && hrs != "11") {
			o = `час${left1 ? ` ${left1}` : ""}`;
		} else if (hrs.endsWith("2") || hrs.endsWith("3") || hrs.endsWith("4")) {
			o = `часa${left2 ? ` ${left2}` : ""}`;
		} else {
			o = `часов${left3 ? ` ${left3}` : ""}`;
		}
		return `${hrs} ${o}`;
	},
	/**
	 *
	 * @param {number | string} seconds
	 * @param {string} left1 осталось
	 * @param {string} left2 осталась
	 * @param {string} left3 осталось
	 * @returns {string}
	 */
	toSecString(seconds, left1, left2, left3) {
		let s = `секунд${left1 ? ` ${left1}` : ""}`,
			sec = `${seconds}`;
		if (sec.endsWith("1") && sec != "11") {
			s = `секунда${left2 ? ` ${left2}` : ""}`;
		} else if (sec.endsWith("2") || sec.endsWith("3") || sec.endsWith("4")) {
			s = `секунды${left3 ? ` ${left3}` : ""}`;
		}
		return `${sec} ${s}`;
	},
	/**
	 *
	 * @param {number | string} minutes
	 * @param {string} left1 осталось
	 * @param {string} left2 осталась
	 * @param {string} left3 осталось
	 * @returns {string}
	 */
	toMinString(minutes, left1, left2, left3) {
		let m = `минут${left1 ? ` ${left1}` : ""}`,
			min = `${minutes}`;
		if (min.endsWith("1") && min != "11") {
			m = `минута${left2 ? ` ${left2}` : ""}`;
		} else if (min.endsWith("2") || min.endsWith("3") || min.endsWith("4")) {
			m = `минуты${left3 ? ` ${left3}` : ""}`;
		}
		return `${min} ${m}`;
	},

	/**
	 *
	 * @param {{name?: string; stack?: string; message: string; on?: object;}} err
	 * @param {boolean} [returnArr]
	 * @returns {string | [string, string, string, string]}
	 */
	errParse(err, returnArr) {
		let message = err.message,
			stack = err.stack.replace(err.message, "").split("\n"),
			type = err.name ?? stack[0].match(/\s+at\s/g) ? stack.shift() : "Error";

		if (message.match(/\d{3}:\s/g)) {
			type = `${type.replace(": ", "")} ${message.split(": ")[0]}: `;
			message = message.split(": ").slice(1).join(": ");
		}

		const stringStack = [
			...new Set(
				stack
					.map((e) => e.replace(/\s+at\s/g, ""))
					.map(lowlevelStackParse)
					.filter((e) => e)
					.map((e) => `\n ${e}`)
			).values(),
		].join("");

		return returnArr
			? [type, message, stringStack, err.on ? util.toStr(err.on, " ") : undefined]
			: `${type.includes(":") ? type : `${type}: `}${message}${stringStack}`;
	},
	/**
	 *
	 * @param {import("telegraf/types").User} user
	 * @returns
	 */
	getName(user) {
		let res = String(user?.first_name ?? user?.username ?? user?.id ?? "WTF");

		if (user?.last_name && res.length + user.last_name.length < 10) res += user.last_name;

		return res;
	},
	/**
	 *
	 * @param {DB.User | null} [dbuser]
	 * @param {import("telegraf/types").User | null} [user]
	 */
	getFullName(dbuser, user) {
		let name = dbuser?.cache?.nickname || dbuser?.static?.name || dbuser?.static?.nickname;

		if (!name && user) name = util.getName(user);
		return name;
	},

	/**
	 *
	 * @param {import("telegraf/types").User} user
	 * @returns
	 */
	getNameFromCache(user) {
		return util.getFullName(database.collection()[d.user(user.id)], user);
	},
	/**
	 *
	 * @param {string} string
	 * @returns
	 */
	capitalizeFirstLetter(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	},
	/**
	 *
	 * @param {string} msg
	 * @param {(s: string) => Promise | void} method
	 */
	async sendSeparatedMessage(msg, method, limit = 4000, safeCount = 5) {
		if (msg.length < limit) return method(msg);

		for (let p = 1; p <= Math.ceil(msg.length / limit) && p <= safeCount; p++) {
			await method(msg.substring(p * limit - limit, p * limit));
		}
	},
};

/**
 * @type {[RegExp | string, string?, number?][]}
 */
const replaces = [
	[/\\/g, "/"],
	["<anonymous>", "</>", 0],
	[/file:.*src\/(.*)/, "src/$1"],
	[/.*Telegram\.callApi.*/, "Telegram.callApi()"],
	[/.*redis.*/, "Redis"],
	[/.*node.*/],
];

/**
 *
 * @param {string} e
 * @returns
 */
function lowlevelStackParse(e) {
	for (const [r, p, count] of replaces) {
		if (typeof e === "string")
			e = count === 0 && typeof e.replaceAll === "function" ? e.replaceAll(r, p ?? "") : e.replace(r, p ?? "");
	}
	return e;
}

/**
 * @typedef {string | number} Nval
 */

export const d = {
	/**
	 *
	 * @param {Nval} id
	 * @returns
	 */
	user: (id) => `User::${id}`,
	/**
	 *
	 * @param {Nval} prefix
	 * @param {Nval} name
	 * @returns
	 */
	pn: (prefix, name) => `${prefix}::${name}`,
	/**
	 *
	 * @param {Nval} id
	 * @returns
	 */
	group: (id) => `Group::${id}`,
	/**
	 *
	 * @param {Nval} name
	 * @param {Nval} stage
	 * @returns
	 */
	session: (name, stage) => `${name}::${stage}`,
	/**
	 * Query link
	 * @param {Nval} prefix
	 * @param {Nval} name
	 * @param  {...Nval} args
	 * @returns
	 */
	query: (prefix, name, ...args) =>
		`${prefix}${d.separator.link}${name}${
			args ? `${d.separator.linkToData}${d.safeJoin(args, d.separator.data)}` : ""
		}`,
	/**
	 *
	 * @param {number} index
	 * @returns
	 */
	guide: (index) => `https://t.me/xillerbotguides/${index}`,
	/**
	 *
	 * @param {number} id
	 * @returns
	 */
	userLink: (id) => `tg://user?id=${id}`,
	// Separator
	separator: {
		link: ".",
		linkToData: "/",
		data: ",",
	},
	/**
	 *
	 * @param {Nval[]} arr
	 * @param {string} separator
	 */
	safeJoin(arr, separator) {
		return arr
			.map(String)
			.map((e) => e.replaceAll(separator, "\\" + separator))
			.join(separator);
	},
};

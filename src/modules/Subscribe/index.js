import { bot, fmt, message, tables } from "../../index.js";
import { u, util } from "../../lib/utils/index.js";
import { SubDB } from "./db.js";

export const Subscriptions = {
	/**
	 * Get setting
	 * @param {number} id
	 * @param {import("./db.js").SubKey} key
	 * @return {boolean} value
	 */
	getUserSetting(id, key) {
		const settings = SubDB.get(id);
		return settings[key];
	},
	/**
	 * @param {import("./db.js").SubKey} key
	 * @returns {number[]}
	 */
	list(key, { searchValue = true } = {}) {
		const users = SubDB.keys().map(Number);
		const passed = [];

		for (const user of users) {
			const subs = SubDB.get(user);
			if (subs[key] === searchValue) passed.push(user);
		}

		return passed;
	},
};

bot.on(message("new_chat_members"), async (ctx) => {
	if (!tables.groups.get(ctx.chat.id).cache.podval) return;
	for (const id of Subscriptions.list("newMembers")) {
		if (!tables.users.get(id).cache.dm) return;

		const members = u.langJoin(
			ctx.message.new_chat_members.map((user) => util.getTelegramName(user))
		);
		const one = members.length === 1;

		await bot.telegram.sendMessage(
			id,
			fmt`В подвале нов${one ? "ый" : "ые"} участни${
				one ? "к" : "ки"
			}!\n${members}`
		);
	}
});

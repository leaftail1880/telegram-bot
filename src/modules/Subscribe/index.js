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
		return SubDB.keys()
			.map(Number)
			.filter((user) => SubDB.get(user)[key] === searchValue);
	},
};

bot.on(message("new_chat_members"), async (ctx) => {
	// if (!tables.groups.get(ctx.chat.id)?.cache.podval) return;

	const members = u.langJoin(
		ctx.message.new_chat_members.map((user) => util.getTelegramName(user))
	);
	const one = members.length === 1;

	for (const id of Subscriptions.list("newMembers")) {
		if (!tables.users.get(id)?.cache?.dm) continue;

		try {
			if (ctx.message.new_chat_members.map((e) => e.id).includes(id)) continue;
			const member = await ctx.getChatMember(id);

			/** @type {import("telegraf/types").ChatMember['status'][]} */
			const activeStatus = ["administrator", "creator", "restricted", "member"];

			if (activeStatus.includes(member.status)) continue;

			await bot.telegram.sendMessage(
				id,
				fmt`В подвале нов${one ? "ый" : "ые"} участни${
					one ? "к" : "ки"
				}!\n${members}`
			);
		} catch (e) {
			console.error(e);
		}
	}

	await ctx.reply("Приветствуем!!111");
});

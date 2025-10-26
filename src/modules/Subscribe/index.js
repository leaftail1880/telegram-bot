import { LeafyDBTable } from "leafy-db";
import {
	bot,
	database,
	fmt,
	FmtString,
	message,
	Service,
	tables,
} from "../../index.js";
import { removeDefaults, setDefaults } from "../../lib/utils/defaults.js";
import { u, util } from "../../lib/utils/index.js";
import { Command } from "../../lib/сommand.js";
import "./menu.js";

/**
 * @satisfies {Record<string, boolean>}
 */
export const DefaultSubs = {
	newMembers: true,
	discordJoinOnce: false,
	discordJoin: false,
};

/** @type {Record<SubKey, string>} */
export const SubNamesText = {
	newMembers: "Новые участники",
	discordJoinOnce: "Ближайший вход в гс в дс",
	discordJoin: "Уведомления о всех входах в гс в дс",
};

/** @typedef {keyof typeof DefaultSubs} SubKey */

/**
 * @type {LeafyDBTable<Record<SubKey, boolean>>}
 */
export const SubDB = database.table("modules/subs.json", {
	beforeGet: (key, value) => setDefaults(value, DefaultSubs),
	beforeSet: (key, value) => removeDefaults(value, DefaultSubs),
});

/**
 * @typedef {(id: number) => (Promise<boolean> | boolean)} SubFilter
 */
export const Subscriptions = {
	/**
	 * Get setting
	 * @param {number} id
	 * @param {SubKey} key
	 * @return {boolean} value
	 */
	getUserSetting(id, key) {
		const settings = SubDB.get(id);
		return settings[key];
	},
	/**
	 *
	 * @param {number} id
	 * @param {SubKey} key
	 * @param {boolean} value
	 */
	setUserSetting(id, key, value) {
		const { data, save } = SubDB.work(id);
		data[key] = value;
		save();
	},
	/**
	 * @param {SubKey} key
	 * @returns {number[]}
	 */
	list(key, { searchValue = true } = {}) {
		return SubDB.keys()
			.map(Number)
			.filter((user) => SubDB.get(user)[key] === searchValue);
	},
	/**
	 * @param {SubKey} key
	 * @param {(SubFilter)} filter
	 * @param {string | FmtString} message
	 * @param {import('telegraf/types').Convenience.ExtraReplyMessage} [extra]
	 */
	async notify(key, filter, message, extra) {
		for (const id of Subscriptions.list(key)) {
			try {
				if (!tables.users.get(id)?.cache?.dm) continue; // no dm no talkies
				if (filter && !(await filter(id))) continue; // get the fuck out of here

				await bot.telegram.sendMessage(id, message, extra); // talkies!!!
			} catch (e) {
				console.error(e); // errories!
			}
		}
	},
};

bot.on(message("new_chat_members"), async (ctx) => {
	if (!tables.groups.get(ctx.chat.id)?.cache.podval) return;

	const members = u.langJoin(
		ctx.message.new_chat_members.map((user) => util.getTelegramName(user))
	);
	const one = members.length === 1;

	await Subscriptions.notify(
		"newMembers",
		async (id) => {
			if (ctx.message.new_chat_members.map((e) => e.id).includes(id))
				return false;

			const member = await ctx.getChatMember(id);

			/** @type {import("telegraf/types").ChatMember['status'][]} */
			const activeStatus = ["administrator", "creator", "restricted", "member"];

			if (activeStatus.includes(member.status)) return false;

			return true;
		},
		one
			? fmt`В подвале новичок!\n${members}`
			: fmt`В подвале новички!\n${members}`
	);

	await ctx.reply("Приветствуем!!11!!1!!! Вам щас всееее расскажут...");
});

Service.onDiscordVCJoin = async (telegram, text) => {
	/** @type {SubFilter} */
	const resetNotify = (id) => {
		Subscriptions.setUserSetting(id, "discordJoinOnce", false);
		return true;
	};

	await Subscriptions.notify("discordJoin", resetNotify, text, {
		disable_web_page_preview: true,
	});

	await Subscriptions.notify("discordJoinOnce", resetNotify, text, {
		disable_web_page_preview: true,
	});
};

new Command(
	{
		name: "dsnotify",
		description: "Включает уведомление о ближайшем входе в дс гс",
	},
	(ctx) => {
		ctx.reply(
			"Теперь вы получите одно уведомление после того как кто-то зайдет в голосовой чат в дс"
		);
		Subscriptions.setUserSetting(ctx.from.id, "discordJoinOnce", true);
	}
);

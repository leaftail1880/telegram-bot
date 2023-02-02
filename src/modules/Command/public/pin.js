import { bot, data, database, Service, tables } from "../../../index.js";
import { Command } from "../../../lib/Class/Command.js";
import { u, util } from "../../../lib/Class/Utils.js";
import { bold, fmt, link } from "../../../lib/Class/Xitext.js";

new Command(
	{
		name: "pin",
		description: "Закрепляет на 5 часов",
		permission: "all",
		target: "group",
	},
	async (ctx, input, data) => {
		if (!data.group || !("cache" in data.group)) throw new TypeError("Pin cannot be called in non-group chats");

		const repl = util.makeReply(ctx, "direct");
		const group = data.group;
		group.cache.pin ??= {};

		let cooldown = 0;
		if (typeof group.cache.pin.lastPins === "object") {
			cooldown = group.cache.pin.lastPins[ctx.from.id];
		} else group.cache.pin.lastPins = {};

		if (cooldown >= Date.now()) {
			const { parsedTime, type } = util.toRemainingTime(cooldown - Date.now());

			return ctx.reply(fmt`Подожди еще ${bold("", link(parsedTime, u.guide(7)))} ${type}`);
		}

		const msgToPin = ctx.message.reply_to_message?.message_id;
		if (!msgToPin) {
			return repl(fmt`${bold("Ответь")} на сообщение для закрепления.`);
		}

		if (group.cache.pin.message_id)
			try {
				await ctx.unpinChatMessage(group.cache.pin.message_id);
			} catch {}

		let raw_num = 1;
		input
			.split(" ")
			.map(Number)
			.forEach((e) => (raw_num *= e));

		const time = isNaN(raw_num) || raw_num < 1 ? 1000 * 60 * 60 * 5 : raw_num * 1000;

		ctx.pinChatMessage(msgToPin, { disable_notification: true });
		group.cache.pin.message_id = msgToPin;
		group.cache.pin.lastPins[ctx.from.id] = time;
		group.cache.pin.date = time;

		tables.groups.set(ctx.chat.id, group);
	}
);

setInterval(async () => {
	if (data.isStopped || database.isClosed) return;
	for (const key of tables.groups.keys()) {
		const { data: group, save } = tables.groups.work(key);

		if (!group?.cache?.pin?.message_id) continue;

		const { message_id, date } = group.cache.pin;

		if (date > Date.now() || !date) {
			const result = bot.telegram.unpinChatMessage(group.static.id, message_id);
			result.catch(Service.error);

			delete group.cache.pin.date;
			delete group.cache.pin.message_id;
			save();
		}
	}
}, 5000);

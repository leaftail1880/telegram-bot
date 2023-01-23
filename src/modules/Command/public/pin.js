import { bot, data, Service, tables } from "../../../index.js";
import { Command } from "../../../lib/Class/Command.js";
import { u, util } from "../../../lib/Class/Utils.js";
import { bold, fmt, link } from "../../../lib/Class/Xitext.js";

const pin_cooldown = 3.6e6;

new Command(
	{
		name: "pin",
		description: "Закрепляет на 5 часов",
		permission: "all",
		target: "group",
	},
	async (ctx, _, data) => {
		const group = data.group;

		if (!group || !("cache" in group)) throw new TypeError("Pin cannot be called in non-group chats");

		let userCDstate = 0;
		if (typeof group.cache.lastPin === "object") {
			userCDstate = group.cache.lastPin[ctx.from.id];
		} else group.cache.lastPin = {};

		const time = Date.now() - userCDstate;

		if (time <= pin_cooldown) {
			const { parsedTime, type } = util.toRemainingTime(pin_cooldown - time);
			const reply = fmt`Подожди еще ${bold("", link(parsedTime, u.guide(7)))} ${type}`;

			return ctx.reply(reply);
		}

		const msgToPin = ctx.message.reply_to_message?.message_id;
		if (!msgToPin) {
			const reply = fmt`${bold("Ответь")} на сообщение для закрепления.`;
			return ctx.reply(reply, {
				reply_to_message_id: ctx.message.from.id,
				allow_sending_without_reply: true,
			});
		}

		if (group.cache.pin) await ctx.unpinChatMessage(Number(group.cache.pin.split("::")[0]));
		ctx.pinChatMessage(msgToPin, { disable_notification: true });
		group.cache.lastPin[ctx.from.id] = Date.now();
		group.cache.pin = `${ctx.message.reply_to_message.message_id}::${Date.now()}`;
		tables.groups.set(ctx.chat.id, group);
	}
);

setInterval(async () => {
	if (data.isStopped || tables.main.isClosed) return;
	for (const key of tables.groups.keys()) {
		const { data: group, save } = tables.groups.work(key);

		const match = group.cache.pin?.match(/(\d+)::(\d+)/);
		if (!match) continue;

		const [, message_id, date] = match.map(Number);

		if (date > Date.now()) {
			const result = bot.telegram.unpinChatMessage(group.static.id, message_id);
			result.catch((e) => Service.error(e));
			delete group.cache.pin;
			save();
		}
	}
}, 5000);

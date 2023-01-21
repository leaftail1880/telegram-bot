import { database } from "../../../index.js";
import { Command } from "../../../lib/Class/Command.js";
import { d, util } from "../../../lib/Class/Utils.js";
import { Xitext } from "../../../lib/Class/Xitext.js";

const pin_cooldown = 3.6e6;

new Command(
	{
		name: "pin",
		description: "Закрепляет на 5 часов",
		permission: "all",
		target: "group",
	},
	async (ctx, _, data) => {
		const g = data.group;

		if (!("cache" in g)) throw new TypeError("Pin cannot be called in non-group chats");

		const u = data.user;
		let lp = 0;
		if (typeof g?.cache?.lastPin === "object") {
			lp = g.cache?.lastPin[u.static.id];
		} else g.cache.lastPin = {};

		const time = Date.now() - lp;

		if (time <= pin_cooldown) {
			const min = Math.round((pin_cooldown - time) / 60000),
				reply = new Xitext()._.group(min + "")
					.bold()
					.url(null, d.guide(7))
					._.group()
					.text(" ")
					.text(util.toMinString(min, "осталось", "осталась", "осталось").split(" ").slice(1).join(" "));
			return ctx.reply(...reply._.build());
		}
		if (!ctx.message?.reply_to_message?.message_id) {
			const text = new Xitext().bold("Отметь").text(" сообщение которое хочешь закрепить!");
			return ctx.reply(text._.text, {
				reply_to_message_id: ctx.message.from.id,
				allow_sending_without_reply: true,
				entities: text._.entities,
			});
		}
		if (g.cache.pin)
			try {
				await ctx.unpinChatMessage(Number(g.cache.pin.split("::")[0]));
			} catch (error) {
				console.warn(error);
			}

		ctx.pinChatMessage(ctx.message.reply_to_message.message_id, {
			disable_notification: true,
		});
		g.cache.lastPin[u.static.id] = Date.now();
		g.cache.pin = `${ctx.message.reply_to_message.message_id}::${Date.now()}`;
		database.set(`Group::${g.static.id}`, g);
	}
);

import { fmt, link } from "telegraf/format";
import { tables } from "../../../index.js";
import { Command } from "../../../lib/Class/Command.js";
import { u, util } from "../../../lib/Class/Utils.js";

new Command(
	{
		name: "sleep",
		target: "group",
		description: "Режим 'Не беспокоить'",
	},
	(ctx, input) => {
		const members = ctx.data.group.cache.silentMembers;
		const l = link(util.getName(ctx.data.user), u.httpsUserLink(ctx.from.username));
		if (members[ctx.from.id]) {
			ctx.reply(fmt`${l} снова с нами!`, {
				reply_to_message_id: ctx.message.message_id,
				allow_sending_without_reply: true,
				disable_web_page_preview: true,
			});

			delete members[ctx.from.id];
		} else {
			ctx.reply(fmt`${l} отдыхает от чата.`, {
				disable_web_page_preview: true,
			});
			members[ctx.from.id] = input ? input : "так спешил(а), что даже не сказал(а) почему...";
		}

		tables.groups.set(ctx.chat.id, ctx.data.group);
	}
);

new Command(
	{
		name: "status",
		description: "Показывает, кто в этом чате не пингуется и почему",
	},
	(ctx) => {
		const members = ctx.data.group.cache.silentMembers;
		if (Object.keys(members).length < 1) return ctx.reply("Ура, никто не спит.");
		let text = fmt`Спят здесь эти:`;
		for (const [who, why] of Object.entries(members)) {
			const user = tables.users.get(who);
			text = fmt`${text}\n ${link(util.getName(user), u.httpsUserLink(user.static.nickname))} потому что ${why}`;
		}
		ctx.reply(text, { disable_notification: true, disable_web_page_preview: true });
	}
);

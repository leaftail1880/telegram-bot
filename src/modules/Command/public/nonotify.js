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
			});

			delete members[ctx.from.id];
		} else {
			ctx.reply(fmt`${l} отдыхает от чата.`, {
				disable_web_page_preview: true,
			});
			members[ctx.from.id] = input ? input : "нельзя";
		}

		tables.groups.set(ctx.chat.id, ctx.data.group);
	}
);

import { fmt, mention } from "telegraf/format";
import { tables } from "../../../index.js";
import { util } from "../../../lib/utils/index.js";
import { Command } from "../../../lib/сommand.js";

new Command(
	{
		name: "call",
		description: "Созывает",
		permission: "group_admins",
		target: "group",
	},
	async (ctx, _, data) => {
		const perMessage = 4;
		let res = fmt``;
		let i = 0;
		let needSave = false;

		for (const member of data.group.cache.members) {
			if (ctx.data.group.cache.silentMembers[member]) continue;
			let user;
			try {
				user = await ctx.getChatMember(member);
			} catch (e) {
				console.error(e);
				data.group.cache.members = data.group.cache.members.filter(
					(e) => e !== member
				);
				needSave = true;
				continue;
			}
			if (user.user.is_bot) continue;
			i++;
			res = fmt`${res}\n$${mention(util.getName(null, user.user), user.user)}`;
			if (i % perMessage === 0) {
				await ctx.reply(res, {
					reply_to_message_id: ctx.message.message_id,
					allow_sending_without_reply: true,
					disable_notification: false,
				});
				res = fmt``;
			}
		}

		if (needSave) tables.groups.set(ctx.chat.id, data.group);
	}
);

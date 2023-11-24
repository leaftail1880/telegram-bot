import { fmt, mention } from "telegraf/format";
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

		for (const member of data.group.cache.members) {
			if (ctx.data.group.cache.silentMembers[member]) continue;
			const user = await ctx.getChatMember(member);
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
	}
);

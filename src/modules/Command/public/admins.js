import { fmt, mention } from "telegraf/format";
import { util } from "../../../lib/utils/index.js";
import { Command } from "../../../lib/сommand.js";

new Command(
	{
		name: "admins",
		target: "group",
		description: "Вызывает админов",
	},
	async (ctx) => {
		const admins = (await ctx.getChatAdministrators()).filter(
			(e) => !e.user.is_bot && !ctx.data.group.cache.silentMembers[e.user.id]
		);
		const perMessage = Math.min(3, admins.length);
		let res = fmt``;

		for (const [i, admin] of admins.entries()) {
			res = fmt`${res}\n$${mention(
				util.getName(null, admin.user),
				admin.user
			)}`;
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

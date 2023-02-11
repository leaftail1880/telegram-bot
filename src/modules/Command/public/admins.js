import { Command } from "../../../lib/Class/Command.js";
import { util } from "../../../lib/Class/Utils.js";
import { Xitext } from "../../../lib/Class/Xitext.js";

new Command(
	{
		prefix: "@",
		name: "admins",
		target: "group",
		description: "Созывает админов",
	},
	async (ctx) => {
		const admins = (await ctx.getChatAdministrators()).filter((e) => !e.user.is_bot);
		const perMessage = Math.min(3, admins.length);
		let res = new Xitext();

		for (const [i, admin] of admins.entries()) {
			res.text("\n").mention(util.getName(null, admin.user), admin.user);
			if (i % perMessage === 0) {
				await ctx.reply(res._.text, {
					reply_to_message_id: ctx.message.message_id,
					allow_sending_without_reply: true,
					disable_notification: false,
					entities: res._.entities,
				});
				res = new Xitext();
			}
		}
	}
);

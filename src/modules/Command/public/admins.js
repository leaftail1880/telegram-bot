import config from "../../../config.js";
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
		const callText = ctx.message.text.replace(config.command.clear, "");
		const admins = (await ctx.getChatAdministrators()).filter((e) => !e.user.is_bot);
		const perMessage = Math.min(3, admins.length);
		let i = 0;
		let res = new Xitext().text(callText);
		for (const admin of admins) {
			i++;
			res.text("\n").mention(util.getName(null, admin.user), admin.user);
			if (i === perMessage) {
				await ctx.reply(res._.text, {
					reply_to_message_id: ctx.message.message_id,
					allow_sending_without_reply: true,
					disable_notification: true,
					entities: res._.entities,
				});
				res = new Xitext().text(callText);
			}
		}
	}
);

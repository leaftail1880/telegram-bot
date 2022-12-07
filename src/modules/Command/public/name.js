import { database } from "../../../index.js";
import { Command } from "../../../lib/Class/Command.js";
import { lang } from "../../OC/index.js";

new Command(
	{
		name: "name",
		description: "Меняет ник",
		permisson: 0,
		type: "all",
	},
	async (ctx, args, data) => {
		const user = data.Euser,
			name = user.cache.nickname;
		if (!args[0])
			return ctx.reply(name ?? "Пустой", {
				reply_to_message_id: ctx.message.message_id,
			});
		if (!args[0] || args[0].length >= 10)
			return ctx.reply(lang.maxLength("Имя", "10-ти")[0], {
				reply_to_message_id: ctx.message.message_id,
				entities: lang.maxLength("Имя", "10-ти")[1].entities,
			});
		ctx.reply(`Ник '${name ?? "Пустой"}' сменен на '${args.join(" ")}'`, {
			reply_to_message_id: ctx.message.message_id,
			allow_sending_without_reply: true,
		});
		user.cache.nickname = args.join(" ");
		database.set("User::" + ctx.message.from.id, user);
	}
);

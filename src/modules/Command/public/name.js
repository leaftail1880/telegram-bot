import { Service, bold, fmt, tables } from "../../../index.js";
import { util } from "../../../lib/utils/index.js";
import { Command } from "../../../lib/сommand.js";

new Command(
	{
		name: "name",
		description: "Меняет ваше имя у бота",
		permission: "all",
		target: "all",
	},
	async (ctx, newname, data) => {
		const user = data.user;
		const defaultName = "<Не установлено>";
		const currentname = user.cache.nickname
			? `'${user.cache.nickname}'`
			: defaultName;

		const reply = util.makeReply(ctx);

		// naming someone/asking for their name
		if (ctx.message.reply_to_message?.from) {
			const repl_user = tables.users.get(ctx.message.reply_to_message.from.id);
			if (!newname) return reply(repl_user.cache.nickname ?? defaultName);

			if (ctx.from.id !== Service.chat.owner)
				return reply("Что? Ты не можешь назвать другого участника");

			repl_user.cache.nickname = newname;
			tables.users.set(repl_user.static.id, repl_user);
			return reply(
				`Хиля назвал тебя ${newname}. Ты можешь сменить ник в любой момент.`
			);
		}

		// asking for self name
		if (!newname) return reply(currentname);

		// setting name
		if (newname.length >= 10)
			return reply(fmt`Имя должно быть ${bold`короче`} 10-ти символов.`);

		user.cache.nickname = newname;
		tables.users.set(ctx.from.id, user);
		reply(`Ник ${currentname} сменен на '${newname}'`);
	}
);

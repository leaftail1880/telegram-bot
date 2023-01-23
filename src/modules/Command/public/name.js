import { data as $data, tables } from "../../../index.js";
import { Command } from "../../../lib/Class/Command.js";
import { bold, fmt } from "../../../lib/Class/Xitext.js";

new Command(
	{
		name: "name",
		description: "Меняет ник",
		permission: "all",
		target: "all",
	},
	async (ctx, input, data) => {
		const user = data.user;
		const name = user.cache.nickname;
		const default_name = "<Не установлен>";
		const repl = (t) =>
			ctx.reply(t, { reply_to_message_id: ctx.message.message_id, allow_sending_without_reply: true });

		if (typeof ctx.message.reply_to_message === "object") {
			const repl_user = tables.users.get(ctx.message.reply_to_message.from.id);
			if (!input) return repl(repl_user.cache.nickname ?? default_name);
			if (ctx.from.id !== $data.chatID.owner) return repl("Что?");

			repl_user.cache.nickname = input;
			tables.users.set(repl_user.static.id, repl_user);
			return repl(`Хиля назвал тебя ${input}. Ты можешь сменить ник в любой момент.`);
		}

		if (!input) return repl(name ?? default_name);

		if (input.length >= 10) return repl(fmt`Имя должно быть ${bold("не")} больше 10-ти символов в длину.`);

		user.cache.nickname = input;
		tables.users.set(ctx.from.id, user);
		repl(`Ник '${name ?? default_name}' сменен на '${input}'`);
	}
);

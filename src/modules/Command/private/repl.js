import config from "../../../config.js";
import { Command } from "../../../lib/Class/Command.js";

new Command(
	{
		name: "repl",
		permission: "bot_owner",
		prefix: true,
		target: "all",
		description: "Отвечает на ссылку с первой строки сообщением со второй",
	},
	(ctx) => {
		const [command] = ctx.message.text.match(config.command.clear);
		const args = ctx.message.text.replace(command, "").split("\n");
		if (args.length < 2) return ctx.reply("Не хватает информации.", { reply_to_message_id: ctx.message.message_id });

		const [raw_link, ...text] = args;
		const parsed_link = raw_link.match(/^https\:\/\/t\.me\/c\/(\d+)\/(\d+)$/);
		if (!parsed_link)
			return ctx.reply("Ссылка не соответствует формату https://t.me/c/chat_id/message_id.", {
				reply_to_message_id: ctx.message.message_id,
			});

		const [__, raw_chat_id, raw_message_id] = parsed_link;
		const message_id = parseInt(raw_message_id);
		const chat_id = parseInt("-100" + raw_chat_id);
		const move_length = command.length + raw_link.length + 2;

		ctx.telegram.sendMessage(chat_id, text.join("\n"), {
			reply_to_message_id: message_id,
			allow_sending_without_reply: true,
			entities: ctx.message.entities
				?.map((e) => {
					e.offset -= move_length;
					return e;
				})
				?.filter((e) => e.offset >= 0),
		});
	}
);

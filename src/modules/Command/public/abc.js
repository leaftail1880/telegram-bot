import { Command } from "../../../lib/Class/Command.js";
import { abc } from "../../../lib/utils/abc.js";

new Command(
	{
		name: "abc",
		description: "Переводит",
		permisson: 0,
		type: "all",
	},
	(ctx) => {
		/**
		 * @type {{text?: string; caption?: string; message_id?: number}}
		 */
		const msg = ctx.message.reply_to_message;
		if (!msg)
			return ctx.reply("Отметь сообщение!", {
				reply_to_message_id: ctx.message.message_id,
				allow_sending_without_reply: true,
			});
		if (!msg.caption && !msg.text) return ctx.reply("Я не могу это перевести!");
		ctx.reply(abc(msg.text ?? msg.caption), {
			reply_to_message_id: msg.message_id,
			allow_sending_without_reply: true,
		});
	}
);

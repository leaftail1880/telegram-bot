import { Command } from "../../../lib/Class/Command.js";
import { fmt, link } from "../../../lib/Class/Xitext.js";

new Command(
	{
		name: "google",
		description: "Гуглит",
		target: "all",
	},
	(ctx, input) => {
		const repl = (t) =>
			ctx.reply(t, {
				reply_to_message_id: ctx.message.reply_to_message?.message_id ?? ctx.message.message_id,
				allow_sending_without_reply: true,
				disable_web_page_preview: false,
			});

		const text = "text" in ctx.message.reply_to_message ? ctx.message.reply_to_message.text : input;

		if (!text)
			return repl(`Либо ответь на сообщение, которое хочешь загуглить, либо отправь "/google Текст для поиска"`);

		const params = new URLSearchParams();
		params.append("q", text);
		const text_link = "https://google.com/search?" + params.toString();

		repl(fmt`${link("Ссылка на запрос", text_link)} ${text} в гугле.`);
	}
);

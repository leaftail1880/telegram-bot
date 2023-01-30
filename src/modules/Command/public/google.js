import { Command } from "../../../lib/Class/Command.js";
import { fmt, link } from "../../../lib/Class/Xitext.js";

new Command(
	{
		name: "google",
		description: "Гуглит",
		target: "all",
	},
	(ctx, input) => {
		const repl = (/** @type {string | ReturnType<fmt>} */ t) =>
			ctx.reply(t, {
				reply_to_message_id: ctx.message.reply_to_message?.message_id ?? ctx.message.message_id,
				allow_sending_without_reply: true,
				disable_web_page_preview: false,
			});

		const reply_msg = ctx.message.reply_to_message;
		const text_in_reply = "text" in reply_msg && reply_msg.text;
		const text = input ?? text_in_reply;

		if (!text)
			return repl(`Либо ответь на сообщение, которое хочешь загуглить, либо отправь "/google Текст для поиска"`);

		const params = new URLSearchParams();
		params.append("q", text);
		const text_link = "https://google.com/search?" + params.toString();

		repl(fmt`Поиск в гугле: ${link(text, text_link)}`);
	}
);

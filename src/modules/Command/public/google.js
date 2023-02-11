import { Command } from "../../../lib/Class/Command.js";
import { util } from "../../../lib/Class/Utils.js";
import { fmt, link } from "../../../lib/Class/Xitext.js";

new Command(
	{
		name: "google",
		description: "Гуглит",
		target: "all",
	},
	(ctx, input) => {
		const repl_msg = ctx.message.reply_to_message;
		const repl = util.makeReply(ctx);
		const text = input ? input : util.get(repl_msg, "text") ?? util.get(repl_msg, "caption");

		if (!text) return repl(`Ответь на сообщение, которое хочешь загуглить, либо отправь "/google Текст для поиска"`);

		const params = new URLSearchParams();
		params.append("q", text);
		const text_link = "https://google.com/search?" + params.toString();

		repl(fmt`Поиск в гугле: ${link(text, text_link)}`);
	}
);

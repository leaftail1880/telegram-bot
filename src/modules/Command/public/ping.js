import { Command } from "../../../lib/Class/Cmd.js";
import { Xitext } from "../../../lib/Class/Xitext.js";

new Command(
	{
		name: "ping",
		description: "Скорость ответа",
		permisson: 0,
		type: "all",
	},
	(ctx) => {
		const data = ~~(Date.now() / 1000);
		ctx.reply(
			...new Xitext()
				.text(`Пинг `)
				.bold(data - ctx.message.date)
				.text("\n\nДата: ")
				.bold(data)
				.text("\nДата сообщения: ")
				.bold(ctx.message.date)
				._.build()
		);
	}
);

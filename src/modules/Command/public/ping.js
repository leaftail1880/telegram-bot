import { Command } from "../../../lib/Class/Command.js";

new Command(
	{
		name: "ping",
		description: "Отправляет скорость ответа",
	},
	(ctx, args, data) => {
		ctx.reply("e");
	}
);

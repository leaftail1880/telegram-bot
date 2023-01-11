import { Command } from "../../../lib/Class/Command.js";

new Command(
	{
		name: "ping",
		description: "Отправляет скорость ответа",
		target: "all",
		prefix: true,
	},
	async (ctx) => {
		const time = performance.now();
		const message = await ctx.reply("Загрузка...");
		ctx.telegram.editMessageText(
			message.chat.id,
			message.message_id,
			null,
			`Пинг: ${(performance.now() - time).toFixed(2)}мс`
		);
	}
);

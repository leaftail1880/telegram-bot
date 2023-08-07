import { Command } from "../../../lib/сommand.js";

new Command(
	{
		name: "ping",
		description: "Отправляет скорость ответа",
		target: "all",
		prefix: true,
	},
	async (ctx) => {
		const send_ping = Date.now() / 1000 - ctx.message.date;
		const time = performance.now();
		const message = await ctx.reply("Загрузка...");
		ctx.telegram.editMessageText(
			message.chat.id,
			message.message_id,
			null,
			`Пинг: ${(performance.now() - time).toFixed(2)}мс${
				send_ping > 1 ? `\nЗадержка ответа: ${send_ping.toFixed(2)}сек` : ""
			}`
		);
	}
);

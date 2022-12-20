import { Command } from "../../../lib/Class/Command.js";

new Command(
	{
		name: "ping",
		description: "Отправляет скорость ответа",
	},
	async (ctx, args, data) => {
		const time = performance.now();
		const message = await ctx.reply("Wait...");
		ctx.telegram.editMessageText(message.chat.id, message.message_id, null, `${performance.now() - time}`);
	}
);

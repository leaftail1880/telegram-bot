import { bot } from "../../lib/launch/tg.js";
import { message } from "telegraf/filters";

bot.use((ctx, next) => {
	/** @type {Stage} */
	const data = ctx.state;

	console.log(data);
	console.log(ctx.update);

	next();
});

const u = message("new_chat_title");

bot.use((ctx, next) => {
	if (u(ctx.update)) console.log(true);
	ctx.deleteMessage(ctx.message.message_id);
});

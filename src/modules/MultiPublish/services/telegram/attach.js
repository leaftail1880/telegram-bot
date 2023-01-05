import { bot } from "../../../../lib/launch/tg.js";

bot.on("channel_post", (ctx) => {
	const a = ctx.update;
	console.log(a);
});

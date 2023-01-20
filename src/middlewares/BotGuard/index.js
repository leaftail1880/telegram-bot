import { bot } from "../../index.js";

bot.use((ctx, next) => {
	if (ctx.from.is_bot) {
		if (ctx.from.id !== ctx.botInfo.id) return;
		if (!("message" in ctx) || !("text" in ctx.message)) return;
		if (!ctx.message.text.includes("--emit")) return;
	}

	next();
});

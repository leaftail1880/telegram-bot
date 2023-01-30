import { bot } from "../../index.js";

bot.drop((ctx) => {
	if (ctx.from?.is_bot) {
		if (ctx.from.id !== ctx.botInfo.id) return true;
		if (!ctx.message || !("text" in ctx.message)) return true;
		if (!ctx.message.text.includes("--emit")) return true;
	}

	return false;
});

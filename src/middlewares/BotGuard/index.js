import { bot, message } from "../../index.js";

bot.drop((ctx) => {
	if (ctx.from?.is_bot) {
		if (ctx.from.id !== ctx.botInfo.id) return true;
		if (message("text")(ctx.update)) {
			if (!ctx.update.message.text.includes("--emit")) return false;
		} else if (message("new_chat_title")(ctx.update)) {
			return false;
		}
	}

	return false;
});

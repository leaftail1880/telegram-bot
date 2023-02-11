import { bot, Service } from "../../index.js";

bot.use(async (ctx, next) => {
	try {
		await next();
	} catch (e) {
		Service.error(e);
		if (ctx.chat.type === "channel") return;

		ctx.reply(`Кобольдя понял, что не все идет по плану.\n${e.message}`);
	}
});

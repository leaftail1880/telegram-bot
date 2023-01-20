import { Service } from "../../../index.js";
import { Command } from "../../../lib/Class/Command.js";

new Command(
	{
		name: "stop",
		prefix: true,
		hideFromHelpList: true,
		description: "Bot App",
		permission: "bot_owner",
	},
	(ctx, args) => {
		const c = args[0];
		if (c !== "BOT" && c !== "ALL" && c !== "none") return ctx.reply('Args[0] need to be "BOT" | "ALL" | "none"');
		Service.stop("Ручная остановка", c);
	}
);

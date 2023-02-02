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
	(ctx, c) => {
		if (c !== "BOT" && c !== "ALL" && c !== "none") return ctx.reply('Input need to be "BOT" | "ALL" | "none"');
		Service.stop("Ручная остановка", c);
	}
);

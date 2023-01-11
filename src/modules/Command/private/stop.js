import { Command } from "../../../lib/Class/Command.js";
import { SERVISE } from "../../../lib/SERVISE.js";

new Command(
	{
		name: "stop",
		prefix: true,
		hideFromHelpList: true,
		description: "Bot App",
		permission: "bot_owner",
	},
	(_a, args) => {
		const c = args[0];
		if (c !== "BOT" && c !== "ALL" && c !== "none") return;
		SERVISE.stop("Ручная остановка", c);
	}
);

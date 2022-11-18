import { Command } from "../../../lib/Class/Command.js";
import { SERVISE } from "../../../lib/SERVISE.js";

new Command(
	{
		name: "stop",
		specprefix: true,
		hide: true,
		description: "Bot App",
		permisson: 2,
	},
	(_a, args) => {
		const c = args[0];
		if (c !== "BOT" && c !== "ALL" && c !== "none") return;
		SERVISE.stop("Ручная остановка", c);
	}
);

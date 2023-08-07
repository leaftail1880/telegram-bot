import { Command } from "../../../lib/сommand.js";
import { sudo } from "../../../sudo.js";

new Command(
	{
		name: "f",
		aliases: ["0", "+", "*", "sudo", "r"],
		description: "Исполнитель",
		permission: "bot_owner",
		prefix: true,
		target: "all",
	},
	sudo
);

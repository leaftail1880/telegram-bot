import { bold } from "cli-color";
import { data } from "../../../index.js";
import { Command } from "../../../lib/Class/Command.js";
import { u } from "../../../lib/Class/Utils.js";
import { fmt, link } from "../../../lib/Class/Xitext.js";

new Command(
	{
		name: "v",
		description: "Версия бота",
		permission: "all",
		target: "all",
		hideFromHelpList: true,
		prefix: true,
	},
	(ctx) => {
		ctx.reply(
			fmt`${link(bold(data.sv), u.guide(8))} ${bold(
				process.env.whereImRunning
			)}`
		);
	}
);

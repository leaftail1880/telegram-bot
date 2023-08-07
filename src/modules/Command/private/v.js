import { bold, fmt, link } from "telegraf/format";
import { Service } from "../../../index.js";
import { u } from "../../../lib/utils/index.js";
import { Command } from "../../../lib/сommand.js";

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
			fmt`${link(bold(Service.sv), u.guide(8))} ${bold(
				process.env.whereImRunning
			)}`
		);
	}
);

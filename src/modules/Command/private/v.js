import { data, env } from "../../../index.js";
import { Command } from "../../../lib/Class/Command.js";
import { u } from "../../../lib/Class/Utils.js";
import { Xitext } from "../../../lib/Class/Xitext.js";

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
			...new Xitext()._.group(data.sv)
				.url(null, u.guide(8))
				.bold()
				._.group()
				.text(` `)
				.bold(env.whereImRunning)
				._.build()
		);
	}
);

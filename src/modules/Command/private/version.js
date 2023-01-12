import { Command } from "../../../lib/Class/Command.js";
import { d } from "../../../lib/Class/Utils.js";
import { Xitext } from "../../../lib/Class/Xitext.js";
import { env } from "../../../lib/launch/tg.js";
import { data } from "../../../lib/Service.js";

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
			...new Xitext()._.group(data.publicVersion.split(" ")[0])
				.url(null, d.guide(8))
				.bold()
				._.group()
				.text(" ")
				.italic(data.publicVersion.split(" ")[1])
				.text(` `)
				.bold(env.whereImRunning)
				._.build()
		);
	}
);

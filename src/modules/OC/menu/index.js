import { Command } from "../../../lib/Class/Command.js";
import { Query } from "../../../lib/Class/Query.js";
import { oc } from "../index.js";

new Command(
	{
		name: "oc",
		description: "Все действия с OC",
		permission: "all",
		target: "private",
	},
	(ctx) => {
		ctx.reply(oc.main, { reply_markup: { inline_keyboard: oc.mainKeyboard }, disable_web_page_preview: true });
	}
);

new Query(
	{
		name: "back",
		prefix: "OC",
		message: "Назад",
	},
	async (ctx) => {
		ctx.editMessageText(oc.main.text, {
			entities: oc.main.entities,
			reply_markup: {
				inline_keyboard: oc.mainKeyboard,
			},
			disable_web_page_preview: true,
		});
	}
);

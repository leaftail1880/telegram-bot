import { Command } from "../../../lib/Class/Command.js";
import { Query } from "../../../lib/Class/Query.js";
import { lang } from "../index.js";

new Command(
	{
		name: "oc",
		description: "Все действия с OC",
		permission: "all",
		target: "private",
	},
	(ctx) => {
		ctx.reply(lang.main, { reply_markup: { inline_keyboard: lang.mainKeyboard }, disable_web_page_preview: true });
	}
);

new Query(
	{
		name: "back",
		prefix: "OC",
		message: "Назад",
	},
	async (ctx) => {
		ctx.editMessageText(lang.main.text, {
			entities: lang.main.entities,
			reply_markup: {
				inline_keyboard: lang.mainKeyboard,
			},
			disable_web_page_preview: true,
		});
	}
);

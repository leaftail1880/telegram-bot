import { Markup } from "../../../index.js";
import { Command } from "../../../lib/Class/Command.js";
import { Query } from "../../../lib/Class/Query.js";
import { editMsg, lang } from "../index.js";
import { sendMessagDeleteRef } from "../utils.js";

new Command(
	{
		name: "oc",
		description: "Все действия с OC",
		permission: "all",
		target: "private",
	},
	(ctx) => {
		ctx.reply(lang.main2, Markup.inlineKeyboard(lang.mainKeyboard));
	}
);

new Query(
	{
		name: "back",
		prefix: "OC",
		message: "Назад",
	},
	async (ctx) => {
		editMsg(ctx, lang.main._.text, {
			entities: lang.main._.entities,
			reply_markup: {
				inline_keyboard: lang.mainKeyboard,
			},
			disable_web_page_preview: true,
		});
	}
);

new Query(
	{
		name: "backdoc",
		prefix: "OC",
		message: "Назад",
	},
	(ctx, data) => {
		sendMessagDeleteRef(ctx, lang.main._.text, lang.main._.entities, lang.mainKeyboard, data[0]);
	}
);

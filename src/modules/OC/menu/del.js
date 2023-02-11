import { Query } from "../../../lib/Class/Query.js";
import { deleteOC } from "../utils.js";
import { lang } from "../index.js"

new Query(
	{
		name: "del",
		prefix: "OC",
		message: "Персонаж удален",
	},
	async (ctx, data) => {
		deleteOC(ctx.callbackQuery.from.id, parseInt(data[0]));
		ctx.editMessageText("Персонаж удален.", {
			reply_markup: {
				inline_keyboard: lang.mainKeyboard,
			},
			disable_web_page_preview: true,
		});
	}
);

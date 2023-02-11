import { Query } from "../../../lib/Class/Query.js";
import { oc } from "../index.js";
import { deleteOC } from "../utils.js";

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
				inline_keyboard: oc.mainKeyboard,
			},
			disable_web_page_preview: true,
		});
	}
);

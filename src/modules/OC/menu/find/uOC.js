import { Query } from "../../../../lib/Class/Query.js";
import { editMsg, lang, ocbutton } from "../../index.js";
import { OC_DB, sendMessagDeleteRef } from "../../utils.js";

new Query(
	{
		name: "uOC",
		prefix: "OC",
	},
	async (ctx, data) => {
		const [page, id, name, delType] = data;
		const buttons = [];
		const userOCS = OC_DB.get(id);
		const menu = [ocbutton("↩️ Назад к поиску (" + page + ")", "find", page)];

		for (const [i, e] of userOCS.entries()) {
			if (e) buttons.push([ocbutton(e.name, "oc", page, i, id, name)]);
		}
		buttons.push(menu);

		ctx.answerCbQuery("ОС " + name);
		if (!delType)
			editMsg(ctx, lang.userOCS(name), {
				reply_markup: { inline_keyboard: buttons },
			});
		else sendMessagDeleteRef(ctx, lang.userOCS(name), null, buttons, delType);
	}
);

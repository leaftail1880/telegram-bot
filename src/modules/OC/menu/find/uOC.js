import { Query } from "../../../../lib/Class/Query.js";
import { Button } from "../../../../lib/Class/Xitext.js";
import { editMsg, lang, link } from "../../index.js";
import { getUserOCs, sendMessagDeleteRef } from "../../utils.js";

new Query(
	{
		name: "uOC",
		prefix: "OC",
	},
	async (ctx, data) => {
		const [page, id, name, delType] = data;
		const buttons = [];
		const userOCS = await getUserOCs(id);
		const menu = [Button("↩️ Назад к поиску (" + page + ")", link("find", page))];

		for (const [i, e] of userOCS.entries()) {
			if (e) buttons.push([Button(e.name, link("oc", page, i, id, name))]);
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

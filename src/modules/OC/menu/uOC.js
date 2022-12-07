import { Query } from "../../../lib/Class/Query.js";
import { Button } from "../../../lib/Class/Xitext.js";
import { editMsg, lang, link } from "../index.js";
import { getUserOCs, sendMessagDeleteRef } from "../utils.js";

new Query(
	{
		name: "uOC",
		prefix: "OC",
	},
	async (ctx, data) => {
		const [page, id, name, delType] = data;
		const btns = [];
		const userOCS = await getUserOCs(id);
		const menu = [new Button("↩️").data(link("find", page))];

		for (const [i, e] of userOCS.entries()) {
			if (e) btns.push([new Button(e.name).data(link("oc", page, i, id, name))]);
		}
		btns.push(menu);

		ctx.answerCbQuery("ОС " + name);
		if (!delType)
			editMsg(ctx, lang.userOCS(name), {
				reply_markup: { inline_keyboard: btns },
			});
		else sendMessagDeleteRef(ctx, lang.userOCS(name), null, btns, delType);
	}
);

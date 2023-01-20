import { Query } from "../../../lib/Class/Query.js";
import { Button } from "../../../lib/Class/Xitext.js";
import { editMsg, lang, link } from "../index.js";
import { getUserOCs, noOC } from "../utils.js";

// Главное меню > Мои персонажи
new Query(
	{
		name: "my",
		prefix: "OC",
	},
	async (ctx) => {
		const {
			from: { id, username },
		} = ctx.callbackQuery;

		const OCs = await getUserOCs(id);
		if (OCs.length < 1) return noOC(ctx);

		const btns = [];
		const menu = [Button("↩️ Назад", link("back"))];
		for (const [i, e] of OCs.entries()) {
			if (e) btns.push([Button(e.name, link("myoc", id, i, username))]);
		}
		btns.push(menu);

		ctx.answerCbQuery("Ваши персонажи");
		editMsg(ctx, lang.myOCS, {
			reply_markup: { inline_keyboard: btns },
		});
	}
);

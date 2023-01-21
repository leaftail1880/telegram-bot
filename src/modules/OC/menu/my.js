import { Query } from "../../../lib/Class/Query.js";
import { editMsg, lang, ocbutton } from "../index.js";
import { noOC, OC_DB } from "../utils.js";

// Главное меню > Мои персонажи
new Query(
	{
		name: "my",
		prefix: "OC",
	},
	(ctx) => {
		const {
			from: { id, username },
		} = ctx.callbackQuery;

		const OCs = OC_DB.get(id);
		if (OCs.length < 1) return noOC(ctx);

		const btns = [];
		const menu = [ocbutton("↩️ Назад", "back")];
		for (const [i, e] of OCs.entries()) {
			if (e) btns.push([ocbutton(e.name, "myoc", id, i, username)]);
		}
		btns.push(menu);

		ctx.answerCbQuery("Ваши персонажи");
		editMsg(ctx, lang.myOCS, {
			reply_markup: { inline_keyboard: btns },
		});
	}
);

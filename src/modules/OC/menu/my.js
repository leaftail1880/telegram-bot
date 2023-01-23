import { Markup } from "../../../index.js";
import { Query } from "../../../lib/Class/Query.js";
import { lang, ocbutton } from "../index.js";
import { noOC, OC_DB } from "../utils.js";

// Главное меню > Мои персонажи
new Query(
	{
		name: "my",
		prefix: "OC",
	},
	(ctx, _, edit) => {
		const OCs = OC_DB.get(ctx.from.id);
		if (OCs.length < 1) return noOC(ctx);

		const buttons = [];
		const menu = [ocbutton("↩️ Назад", "back")];
		for (const [i, oc] of OCs.entries()) {
			if (oc && oc.name) buttons.push([ocbutton(oc.name, "myoc", i)]);
		}
		buttons.push(menu);

		ctx.answerCbQuery("Ваши персонажи");
		edit(lang.myOCS, Markup.inlineKeyboard(buttons));
	}
);

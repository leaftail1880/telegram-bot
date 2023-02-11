import { Query } from "../../../lib/Class/Query.js";
import { util } from "../../../lib/Class/Utils.js";
import { oc, ocbutton } from "../index.js";
import { noOC, OC_DB } from "../utils.js";

// Главное меню > Мои персонажи > |Персонаж|
new Query(
	{
		name: "myoc",
		prefix: "OC",
	},
	(ctx, data, edit) => {
		const [raw_oc_index] = data;
		const oc_index = parseInt(raw_oc_index);
		const OCs = OC_DB.get(ctx.from.id);
		const ownerNickname = util.getName(null, ctx.from);
		if (!OCs || !OCs[oc_index]) return noOC(ctx);

		/** @type {import("../utils.js").Character} */
		const OC = OCs[oc_index];
		const capt = oc.mOC(OC.name, OC.path);

		ctx.answerCbQuery(OC.name);
		edit(capt.text, {
			entities: capt.entities,
			disable_web_page_preview: true,
			reply_markup: {
				inline_keyboard: [
					[ocbutton("Редактировать", "edit", oc_index, ownerNickname)],
					[ocbutton("Удалить", "del", oc_index)],
					[ocbutton("↩️", "my")],
				],
			},
		});
	}
);

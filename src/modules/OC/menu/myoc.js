import { Query } from "../../../lib/Class/Query.js";
import { Button } from "../../../lib/Class/Xitext.js";
import { lang, link } from "../index.js";
import { getRefType, getUserOCs, noOC, sendRef } from "../utils.js";

// Главное меню > Мои персонажи > |Персонаж|
new Query(
	{
		name: "myoc",
		prefix: "OC",
	},
	async (ctx, data) => {
		const [id, oc_index, ownerNickname] = data;
		const OCs = await getUserOCs(id);
		if (!oc_index || !OCs || !OCs[oc_index]) return noOC(ctx);

		const OC = OCs[oc_index];
		const capt = lang.OC(OC.name, OC.description, ownerNickname, Number(id));
		const refType = getRefType(OC.fileid, capt._.text);

		ctx.answerCbQuery(OC.name);
		sendRef(ctx, OC.fileid, capt._.text, capt._.entities, [
			[new Button("Изменить").data(link("edit", oc_index, ownerNickname))],
			[new Button("Удалить").data(link("del", oc_index, refType))],
			[new Button("↩️").data(link("backdoc", refType))],
		]);
	}
);

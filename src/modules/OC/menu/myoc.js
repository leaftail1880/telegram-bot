import { Query } from "../../../lib/Class/Query.js";
import { lang, ocbutton } from "../index.js";
import { getRefType, noOC, OC_DB, sendRef } from "../utils.js";

// Главное меню > Мои персонажи > |Персонаж|
new Query(
	{
		name: "myoc",
		prefix: "OC",
	},
	(ctx, data) => {
		const [id, oc_index, ownerNickname] = data;
		const OCs = OC_DB.get(id);
		if (!oc_index || !OCs || !OCs[oc_index]) return noOC(ctx);

		const OC = OCs[oc_index];
		const capt = lang.OC(OC.name, OC.description, ownerNickname, Number(id));
		const refType = getRefType(OC.fileid, capt._.text);

		ctx.answerCbQuery(OC.name);
		sendRef(ctx, OC.fileid, capt._.text, capt._.entities, [
			[ocbutton("Изменить", "edit", oc_index, ownerNickname)],
			[ocbutton("Удалить", "del", oc_index, refType)],
			[ocbutton("↩️", "backdoc", refType)],
		]);
	}
);

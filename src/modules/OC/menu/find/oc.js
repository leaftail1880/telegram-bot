import { Query } from "../../../../lib/Class/Query.js";
import { Button } from "../../../../lib/Class/Xitext.js";
import { lang, link } from "../../index.js";
import { getRefType, getUserOCs, noOC, sendRef } from "../../utils.js";

new Query(
	{
		name: "oc",
		prefix: "OC",
	},
	async (ctx, data) => {
		const [page, oc_index_unparsed, id, name] = data;
		const oc_index = parseInt(oc_index_unparsed);
		const OCs = await getUserOCs(id);
		if (!oc_index_unparsed || !OCs || !OCs[oc_index]) return noOC(ctx);

		const OC = OCs[oc_index];
		const capt = lang.OC(OC.name, OC.description, name, Number(id));
		const refType = getRefType(OC.fileid, capt._.text);

		ctx.answerCbQuery(OC.name);
		sendRef(ctx, OC.fileid, capt._.text, capt._.entities, [
			[new Button("В главное меню").data(link("backdoc", refType))],
			[new Button("Назад к персонажам").data(link("uOC", page, id, name, refType))],
		]);
	}
);

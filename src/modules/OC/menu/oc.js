import { Query } from "../../../lib/Class/Query.js";
import { Button } from "../../../lib/Class/Xitext.js";
import { lang, link } from "../index.js";
import { getOCS, getRefType, noOC, sendRef } from "../utils.js";

new Query(
	{
		name: "oc",
		prefix: "OC",
	},
	async (ctx, data) => {
		const OCs = await getOCS();
		const [page, oc_pos, id, name] = data;
		if (!oc_pos || !OCs[id]?.map || !OCs[id][oc_pos]) return noOC(ctx);

		const OC = OCs[id][oc_pos];
		const capt = lang.OC(OC.name, OC.description, name, Number(id));
		const refType = getRefType(OC.fileid, capt._.text);

		ctx.answerCbQuery(OC.name);
		sendRef(ctx, OC.fileid, capt._.text, capt._.entities, [
			[
				new Button("↩️↩️").data(link("backdoc", refType)),
				new Button("↩️").data(link("uOC", page, id, name, refType)),
			],
		]);
	}
);

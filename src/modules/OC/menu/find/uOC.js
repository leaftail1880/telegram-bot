import { Markup, tables } from "../../../../index.js";
import { Query } from "../../../../lib/Class/Query.js";
import { util } from "../../../../lib/Class/Utils.js";
import { oc, ocbutton } from "../../index.js";
import { OC_DB } from "../../utils.js";

new Query(
	{
		name: "uOC",
		prefix: "OC",
	},
	async (ctx, data, edit) => {
		const [page, id] = data;
		const user = tables.users.get(id);
		const name = util.getName(user);
		const buttons = [];
		const userOCS = OC_DB.get(id);
		const menu = [ocbutton("↩️ Назад к поиску (" + page + ")", "find", page)];
		let hasOldOCs = false;

		for (const oc of userOCS.values()) {
			if (oc && oc.name && oc.path) buttons.push([Markup.button.url(oc.name, `https://telegra.ph/${oc.path}`)]);
			else hasOldOCs = true;
		}
		buttons.push(menu);

		ctx.answerCbQuery("ОС " + name);
		const lan = oc.ocs(name, user.static.nickname, user.static.id, hasOldOCs);
		edit(lan.text, {
			entities: lan.entities,
			reply_markup: { inline_keyboard: buttons },
			disable_web_page_preview: true,
		});
	}
);

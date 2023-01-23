import { tables } from "../../../../index.js";
import { Query } from "../../../../lib/Class/Query.js";
import { util } from "../../../../lib/Class/Utils.js";
import { lang, m, ocbutton } from "../../index.js";
import { noOC, OC_DB } from "../../utils.js";

new Query(
	{
		name: "find",
		prefix: "OC",
		message: "Поиск",
	},
	async (ctx, data, edit) => {
		const keys = OC_DB.keys();

		if (!keys[0]) return noOC(ctx);

		let buttons = [];
		let parsed_page = parseInt(data[0]);
		let page = !isNaN(parsed_page) && parsed_page > 0 ? parsed_page : 1;

		for (const id of keys) {
			try {
				const user = tables.users.get(id);
				const userName = util.getName(user);
				if (!userName) continue;

				const name = userName.charAt(0).toUpperCase() + userName.slice(1);
				buttons.push([ocbutton(name, "uOC", page, id)]);
			} catch {}
		}

		buttons = m.generatePageSwitcher({
			buttons: buttons,
			backButton: ocbutton(m.config.backButtonSymbol, "back"),
			queryName: "find",
			pageTo: page,
		});

		edit(lang.find, {
			reply_markup: { inline_keyboard: buttons },
		});
	}
);

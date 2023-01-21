import { tables } from "../../../../index.js";
import { Query } from "../../../../lib/Class/Query.js";
import { util } from "../../../../lib/Class/Utils.js";
import { editMsg, lang, m, ocbutton } from "../../index.js";
import { noOC, OC_DB } from "../../utils.js";

new Query(
	{
		name: "find",
		prefix: "OC",
		message: "Поиск",
	},
	async (ctx, data) => {
		// editMsg(ctx, "Загрузка...");
		const keys = OC_DB.keys();

		if (!keys[0]) {
			editMsg(ctx, lang.main2.text, {
				entities: lang.main2.entities,
				reply_markup: {
					inline_keyboard: lang.mainKeyboard,
				},
				disable_web_page_preview: true,
			});
			return noOC(ctx);
		}

		let buttons = [];
		let raw_page = parseInt(data[0]);
		let page = raw_page > 0 && !isNaN(raw_page) ? raw_page : 1;

		for (const id of keys) {
			try {
				const user = tables.users.get(id);

				const u = util.getFullName(user);

				if (u) {
					const name = util.capitalizeFirstLetter(u);
					buttons.push([ocbutton(name, "uOC", page, id, name)]);
				}
			} catch {}
		}
		buttons = m.generatePageSwitcher({
			buttons: buttons,
			backButton: ocbutton(m.config.backButtonSymbol, "back"),
			queryName: "find",
			pageTo: page,
		});

		editMsg(ctx, lang.find, {
			reply_markup: { inline_keyboard: buttons },
		});
	}
);

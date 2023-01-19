import { database, tables } from "../../../../index.js";
import { Query } from "../../../../lib/Class/Query.js";
import { util } from "../../../../lib/Class/Utils.js";
import { Button } from "../../../../lib/Class/Xitext.js";
import { editMsg, lang, link, m } from "../../index.js";
import { noOC } from "../../utils.js";

new Query(
	{
		name: "find",
		prefix: "OC",
		message: "Поиск",
	},
	async (ctx, data) => {
		// editMsg(ctx, "Загрузка...");
		const keys = database
			.keys()
			.filter((e) => e.startsWith("oc::"))
			.map((e) => e.split("::")[1]);
		if (!keys[0]) {
			editMsg(ctx, lang.main._.text, {
				entities: lang.main._.entities,
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
					buttons.push([new Button(name).data(link("uOC", page, id, name))]);
				}
			} catch {}
		}
		buttons = m.generatePageSwitcher({
			buttons: buttons,
			backButton: new Button(m.config.backButtonSymbol).data(link("back")),
			queryName: "find",
			pageTo: page,
		});

		editMsg(ctx, lang.find, {
			reply_markup: { inline_keyboard: buttons },
		});
	}
);

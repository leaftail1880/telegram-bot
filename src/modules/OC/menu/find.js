import { database } from "../../../index.js";
import { Query } from "../../../lib/Class/Query.js";
import { d, util } from "../../../lib/Class/Utils.js";
import { Button } from "../../../lib/Class/Xitext.js";
import { editMsg, lang, link, m } from "../index.js";
import { noOC } from "../utils.js";

new Query(
	{
		name: "find",
		prefix: "OC",
		message: "Поиск",
	},
	async (ctx, data) => {
		// editMsg(ctx, "Загрузка...");
		const keys = (await database.keys("*")).filter((e) => e.startsWith("oc::"));
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
		let btns = [];
		let page = Number(data[0]) > 0 ? Number(data[0]) : 1;

		for (const e of keys.sort()) {
			try {
				const id = e.split("::")[1];
				/**
				 * @type {DB.User}
				 */
				const user = await database.cache.get(d.user(id), 1000 * 60);

				const u = util.getFullName(user);

				if (u) {
					const name = util.capitalizeFirstLetter(u);
					btns.push([new Button(name).data(link("uOC", page, id, name))]);
				}
			} catch (e) {}
		}
		btns = m.generatePageSwitcher(btns, new Button(m.config.backButtonSymbol).data(link("back")), "find", page);

		editMsg(ctx, lang.find, {
			reply_markup: { inline_keyboard: btns },
		});
	}
);

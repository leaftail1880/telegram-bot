import { MultiMenu } from "../../lib/menu.js";

const SubMenu = new MultiMenu("SB");
const button = SubMenu.buttonMaker();

import { Command } from "../../lib/сommand.js";
import { DefaultSubs, SubNamesText, Subscriptions } from "./index.js";

new Command(
	{
		name: "sub",
		target: "private",
		permission: "all",
		description: "Меню подписок/уведомлений",
		aliases: ["s"],
	},
	async (ctx) => {
		ctx.reply(...SubMenuLang(ctx.from.id));
	}
);

/**
 * @param {number} id
 * @returns {[string, import("telegraf/types").Convenience.ExtraReplyMessage]}
 */
function SubMenuLang(id, page = 1) {
	return [
		"Список ваших подписок",
		{
			reply_markup: {
				inline_keyboard: SubMenu.generatePageSwitcher({
					buttons: Object.entries(DefaultSubs).map(([key, defaultValue]) => {
						/** @type {import("./index.js").SubKey} */
						// @ts-expect-error
						const kkey = key;
						const value = Subscriptions.getUserSetting(id, kkey);
						return [
							button(
								`${value ? "✅" : "🔺"} ${SubNamesText[kkey]}`,
								"c",
								page,
								key,
								value ? 0 : 1
							),
						];
					}),
					queryName: "page",
					pageTo: page,
				}),
			},
		},
	];
}

SubMenu.query({ name: "page" }, async (ctx, path, edit) => {
	// @ts-expect-error
	edit(...SubMenuLang(ctx.callbackQuery.from.id, Number(path[0])));
});

SubMenu.query({ name: "c" }, async (ctx, path, edit) => {
	if (!Object.keys(DefaultSubs).includes(path[1]))
		return console.warn("Unknown sub", path.join(" "));

	/** @type {import("./index.js").SubKey} */
	// @ts-expect-error
	const kkey = path[1];
	Subscriptions.setUserSetting(ctx.from.id, kkey, Number(path[2]) === 1);

	// @ts-expect-error
	edit(...SubMenuLang(ctx.callbackQuery.from.id, Number(path[0])));
});

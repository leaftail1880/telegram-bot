import { Command } from "../../lib/Class/Command.js";
import { d } from "../../lib/Class/Utils.js";
import { Button, Xitext } from "../../lib/Class/Xitext.js";
import { DefaultSubs, SubMenu, Subs } from "./menu.js";
import { PersonalSubs } from "./Subscriptions.js";

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

function SubMenuLang(id, page = 1) {
	const c = new Xitext();

	c.text("Список ваших ").url("подписок", d.guide(9)).text(":");

	const s = new PersonalSubs(id);

	const B = ([setting, value]) => [
		Button(`${value ? "✅" : "🔺"} ${Subs[setting][1]}`, SubMenu.link("c", page, setting, value ? 0 : 1)),
	];

	const get = Object.entries(s.get());
	const buttons = get.map(B);

	c.inlineKeyboard(...SubMenu.generatePageSwitcher({ buttons, queryName: "page", pageTo: page }));

	return c._.build();
}

SubMenu.query({ name: "page" }, async (ctx, path, edit) => {
	edit(...SubMenuLang(ctx.callbackQuery.from.id, Number(path[0])));
});

SubMenu.query({ name: "c" }, async (ctx, path, edit) => {
	if (!Object.keys(DefaultSubs).includes(path[1])) return console.warn(path.join(" "));

	const c = new PersonalSubs(ctx.from.id);

	// @ts-expect-error
	c.set(path[1], Number(path[2]) === 1);

	edit(...SubMenuLang(ctx.callbackQuery.from.id, Number(path[0])));
});

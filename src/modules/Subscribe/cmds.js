import { Command } from "../../lib/Class/Command.js";
import { Query } from "../../lib/Class/Query.js";
import { PersonalSubs } from "../../lib/Class/Subscriptions.js";
import { $PREFIX, DefaultSubs, lang } from "./menu.js";

new Command(
	{
		name: "sub",
		target: "private",
		permission: "all",
		description: "Меню подписок/уведомлений",
		aliases: ["s"],
	},
	async (ctx) => {
		ctx.reply(...(await lang.main(ctx.from.id)));
	}
);

new Query(
	{
		prefix: $PREFIX,
		name: "page",
	},
	async (ctx, path, edit) => {
		edit(...(await lang.main(ctx.callbackQuery.from.id, Number(path[0]))));
	}
);

new Query(
	{
		prefix: $PREFIX,
		name: "c",
	},
	async (ctx, path, edit) => {
		if (!Object.keys(DefaultSubs).includes(path[1])) return console.warn(path.join(" "));

		const c = new PersonalSubs(ctx.from.id);

		// @ts-expect-error
		await c.set(path[1], Number(path[2]) === 1);

		edit(...(await lang.main(ctx.callbackQuery.from.id, Number(path[0]))));
	}
);

import { bot, database } from "../../index.js";
import { Command } from "../../lib/Class/Command.js";
import { MultiMenu } from "../../lib/Class/Menu.js";
import { Query } from "../../lib/Class/Query.js";
import { d, util } from "../../lib/Class/Utils.js";
import { Button, Xitext } from "../../lib/Class/Xitext.js";

(async () => {
	const m = new MultiMenu("DB");

	const me = await bot.telegram.getMe();

	const lang = {
		main: (page) => new Xitext().text(`[${page}] База данных `).url(util.getName(me), d.userLink(me.id)),
		generateMenu: (page = 1) => {
			let keys = database.keys();
			let buttons = [];

			for (const e of keys.sort()) {
				buttons.push([new Button(e).data(m.link("manage", e, page))]);
			}
			buttons = m.generatePageSwitcher({
				buttons: buttons,
				//backButton: new Button(m.config.backButtonSymbol).data(d.query("all", "delmsg")),
				queryName: "list",
				pageTo: page,
			});
			return buttons;
		},
		page: (page) => new Button(m.config.backButtonSymbol).data(m.link("list", page)),
		manage: (key, prevPage) =>
			new Xitext()
				.mono(key)
				.inlineKeyboard(
					[
						new Button("Просмотреть").data(m.link("see", key, prevPage)),
						// new Button("Изменить").data(m.link("edit", key)),
					],
					[
						// new Button("Сменить имя").data(m.link("name", key)),
						new Button("Удалить").data(m.link("del", key, prevPage)),
					],
					[lang.page(prevPage)]
				)
				._.build(),
		see: (key, data, page) =>
			new Xitext()
				.mono(key)
				.text("\n")
				.text(data)
				.inlineKeyboard([new Button("Назад").data(m.link("manage", key, page))])
				._.build(),
	};

	new Query(
		{
			name: "list",
			prefix: m.prefix,
			message: "Список",
		},
		async (_ctx, data, edit) => {
			edit(
				...lang
					.main(data[0])
					.inlineKeyboard(...(await lang.generateMenu(Number(data[0]))))
					._.build({ disable_web_page_preview: true })
			);
		}
	);

	new Query(
		{
			name: "see",
			prefix: m.prefix,
		},
		async (_ctx, data, edit) => {
			const dat = util.inspect(await database.get(data[0]));
			edit(...lang.see(data[0], dat, data[1]));
		}
	);

	new Query(
		{
			name: "del",
			prefix: m.prefix,
		},
		async (_ctx, data, edit) => {
			database.delete(data[0]);
			edit("Успешно удалено.", {
				reply_markup: {
					inline_keyboard: lang.generateMenu(Number(data[1])),
				},
			});
		}
	);

	new Query(
		{
			name: "manage",
			prefix: m.prefix,
		},
		async (_ctx, data, edit) => {
			edit(...lang.manage(data[0], data[1]));
		}
	);

	new Command(
		{
			name: "db2",
			description: "База данных нового поколения",
			permission: "bot_owner",
			hideFromHelpList: false,
			target: "private",
		},
		async (ctx) => {
			ctx.reply(
				...lang
					.main(1)
					.inlineKeyboard(...lang.generateMenu(1))
					._.build()
			);
		}
	);
})();

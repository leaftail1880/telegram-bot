import { data, tables } from "../../index.js";
import { Query } from "../../lib/Class/Query.js";
import { Button, Xitext } from "../../lib/Class/Xitext.js";
import { link } from "../../modules/OC/index.js";

new Query(
	{
		prefix: "N",
		name: "accept",
	},
	(_ctx, path, edit) => {
		data.joinCodes[Number(path[0])] = "accepted";
		edit(
			...new Xitext()
				.text(`Запрос на лс принят`)
				.mono(path[0])
				.inlineKeyboard([Button("Удалить", link("N", "del", "u", path[0]))])
				._.build()
		);
	}
);

new Query(
	{
		prefix: "N",
		name: "group",
	},
	(_ctx, path, edit) => {
		data.joinCodes[Number(path[0])] = "accepted";
		edit(
			...new Xitext()
				.text(`Запрос группы принят`)
				.mono(path[0])
				.inlineKeyboard([Button("Удалить", link("N", "del", "g", path[0]))])
				._.build()
		);
	}
);

new Query(
	{
		prefix: "N",
		name: "del",
	},
	async (ctx, [type, chat]) => {
		tables[type === "g" ? "groups" : "users"].delete(chat);
		await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
		ctx.answerCbQuery("Успешно!");
	}
);
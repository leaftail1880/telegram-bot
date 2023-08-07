import { code, fmt } from "telegraf/format";
import { Service, tables } from "../../index.js";
import { Query } from "../../lib/query.js";
import { u } from "../../lib/utils/index.js";

new Query(
	{
		prefix: "N",
		name: "accept",
	},
	(ctx, path) => {
		Service.joins[Number(path[0])] = "accepted";
		const text = fmt`Запрос на лс принят ${code(path[0])}`;
		ctx.editMessageText(text.text, {
			entities: text.entities,
			reply_markup: {
				inline_keyboard: [[u.btn("Удалить", "N", "del", "u", path[0])]],
			},
		});
	}
);

new Query(
	{
		prefix: "N",
		name: "group",
	},
	(ctx, path) => {
		Service.joins[Number(path[0])] = "accepted";
		const text = fmt`Запрос на группу принят ${code(path[0])}`;
		ctx.editMessageText(text.text, {
			entities: text.entities,
			reply_markup: {
				inline_keyboard: [[u.btn("Удалить", "N", "del", "g", path[0])]],
			},
		});
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

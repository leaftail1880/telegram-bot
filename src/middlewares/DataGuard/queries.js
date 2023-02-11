import { data, tables } from "../../index.js";
import { Query } from "../../lib/Class/Query.js";
import { btn, code, fmt } from "../../lib/Class/Xitext.js";

new Query(
	{
		prefix: "N",
		name: "accept",
	},
	(ctx, path) => {
		data.joinCodes[Number(path[0])] = "accepted";
		const text = fmt`Запрос на лс принят ${code(path[0])}`;
		ctx.editMessageText(text.text, {
			entities: text.entities,
			reply_markup: { inline_keyboard: [[btn("Удалить", "N", "del", "u", path[0])]] },
		});
	}
);

new Query(
	{
		prefix: "N",
		name: "group",
	},
	(ctx, path) => {
		data.joinCodes[Number(path[0])] = "accepted";
		const text = fmt`Запрос на группу принят ${code(path[0])}`;
		ctx.editMessageText(text.text, {
			entities: text.entities,
			reply_markup: { inline_keyboard: [[btn("Удалить", "N", "del", "g", path[0])]] },
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

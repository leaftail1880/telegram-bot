import { Query } from "../../../lib/Class/Query.js";
import { deleteOC } from "../utils.js";

new Query(
	{
		name: "del",
		prefix: "OC",
		message: "Персонаж удален",
	},
	async (ctx, data) => {
		deleteOC(ctx.callbackQuery.from.id, Number(data[0]));
		await ctx.telegram.deleteMessage(ctx.callbackQuery.message.chat.id, ctx.callbackQuery.message.message_id);
		if (data[1] === "mm")
			await ctx.telegram.deleteMessage(ctx.callbackQuery.message.chat.id, ctx.callbackQuery.message.message_id - 1);
	}
);

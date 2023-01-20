import { bot, tables } from "../../index.js";
import { getGroup, getUser } from "./get.js";
import "./queries.js";

bot.on("message", async (ctx, next) => {
	ctx.data ??= {};

	if (ctx.chat.type === "group" || ctx.chat.type === "supergroup") {
		const group = await getGroup(ctx);

		if (!group) return;
		ctx.data.group = group;
	}

	const user = await getUser(ctx);
	if (!user) return;

	ctx.data.user = user;

	if (ctx.data.user.needSafe) {
		delete ctx.data.user.needSafe;
		tables.users.set(ctx.from.id, ctx.data.user);
	}

	next();
});

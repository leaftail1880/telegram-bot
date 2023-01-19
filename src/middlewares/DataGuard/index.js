import { bot, database } from "../../index.js";
import { d } from "../../lib/Class/Utils.js";
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
		database.set(d.user(ctx.from.id), ctx.data.user);
	}

	next();
});

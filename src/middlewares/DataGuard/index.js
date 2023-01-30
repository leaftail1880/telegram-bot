import { bot, newlog, tables } from "../../index.js";
import { fmt } from "../../lib/Class/Xitext.js";
import { getGroup, getUser } from "./get.js";
import "./queries.js";

bot.use(async (ctx, next) => {
	if (!("message" in ctx)) return next();
	ctx.data ??= {};

	if (ctx.chat.type === "channel") {
		newlog({ text: fmt`Сhannel: ${ctx.chat.title}\n@${ctx.chat.username}\n${ctx.chat.id}` });
		return;
	}

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

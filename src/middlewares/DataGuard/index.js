import { bot, tables } from "../../index.js";
import { MultiLogger } from "../../lib/utils/logger.js";
import { getGroup, getUser } from "./get.js";
import "./queries.js";

export const GuardLogger = new MultiLogger("guard.txt");

bot.use(async (ctx, next) => {
	if (!ctx.from || !ctx.chat || ctx.from.is_bot) return next();

	ctx.data ??= {};

	if (ctx.chat?.type === "channel") return;

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

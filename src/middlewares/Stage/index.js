console.log("Loaded Stage");

import { bot } from "../../index.js";

bot.use(async (ctx, next) => {
	const data = ctx.data;
	if (!data) return next();

	if (typeof data.user.cache.scene !== "string") return next();

	const match = data.user.cache.scene.match(/^(.+)::(.+)$/);

	if (!match) return next();

	const [_, name, state] = match;
	const int_state = Number(state);
	data.scene = { name, state, int_state };

	next();
});

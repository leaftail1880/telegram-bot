import { EventListener } from "../../lib/Class/Events.js";

EventListener("message", 10, async (_ctx, next, data) => {
	if (typeof data.user.cache.session !== "string") return next();

	const match = data.user.cache.session.match(/^(.+)::(.+)$/);

	if (!match) return next();

	const [_, name, state] = match;
	const int_state = Number(state);
	data.session = { name, state, int_state };

	next();
});

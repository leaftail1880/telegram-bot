import { database } from "../../index.js";
import { EventListener } from "../../lib/Class/Events.js";
import { d } from "../../lib/Class/Utils.js";
import { getGroup, getUser } from "./get.js";
import "./queries.js";

EventListener("message", 10, async (ctx, next, _DATA) => {
	/** @type {IEvent.Data} */
	let data = {};

	const user = await getUser(ctx);

	if (user === false) return;

	data.user = user;

	if (ctx.chat.type === "group" || ctx.chat.type === "supergroup") {
		const group = await getGroup(ctx);

		if (group === false) return;

		data.group = group;
	}

	if (data.user.needSafe) {
		delete data.user.needSafe;
		await database.set(d.user(ctx.from.id), data.user);
	}

	for (const key in data) _DATA[key] = data[key];

	next();
});

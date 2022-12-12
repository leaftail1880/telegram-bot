import config from "../../config.js";
import { database } from "../../index.js";
import { InternalListener } from "../../lib/Class/Events.js";
import { d } from "../../lib/Class/Utils.js";
import { XTimer } from "../../lib/Class/XTimer.js";
import { getGroup, getUser } from "./get.js";
import "./queries.js";

/**
 * @type {Object<string, InternalEvent.Data>}
 */
const LastData = {};
const FastMessage = (/** @type {string} */ key) => !new XTimer(config.update.cacheTime, true).isExpired(key);

InternalListener("message", 10, async (ctx, next, _DATA) => {
	/** @type {InternalEvent.Data} */
	let data = {};

	if (ctx.from.id in LastData && FastMessage(ctx.from.id + "")) {
		data = LastData[ctx.from.id];
	}
	if (!data.user) {
		const user = await getUser(ctx);

		if (user === false) return;

		data.user = user;
	}

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

	// Adds current GET
	LastData[ctx.from.id] = data;

	next();
});

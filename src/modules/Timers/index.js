import { bot, data, database, Service } from "../../index.js";
import { d } from "../../lib/Class/Utils.js";
import { cooldown } from "../Command/index.js";

setInterval(async () => {
	if (data.isStopped || database.isClosed) return;
	const groups = database
		.keys()
		.filter((e) => e.startsWith("Group::"))
		.map((e) => parseInt(e.split("::")[1]))
		.filter((e) => typeof e === "number");

	groups.forEach(async (e) => {
		const group = tables.groups.get(e);
		if (typeof group?.cache?.pin === "string") {
			const id = Number(group.cache.pin.split("::")[0]);

			const date = Number(group.cache.pin.split("::")[1]);

			if (!date || !id) return;
			if (date + cooldown <= Date.now()) {
				const result = bot.telegram.unpinChatMessage(group.static.id, id);
				result.catch((e) => Service.error(e));
				delete group.cache.pin;
				database.set(d.group(e), group);
			}
		}
	});
}, 5000);

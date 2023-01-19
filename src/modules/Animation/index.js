import { bot, database } from "../../index.js";
import { data } from "../../lib/Service.js";
import { message } from "telegraf/filters";

const filter = message("new_chat_title");

bot.use((ctx, next) => {
	if (filter(ctx.update)) {
		ctx.deleteMessage(ctx.message.message_id);
	}
	next();
});

/**
 *
 * @returns {Promise<Array<DB.Group>>}
 */
async function getRegisteredGroups() {
	const groups = [];

	const keys = await database.keysAsync(`Group::*`);

	for (const key of keys) groups.push(await database.get(key, true));

	return groups;
}

const active = {};

/**
 *
 * @param {DB.Group} group
 */
function Animate(group) {
	const id = group.static.id;
	if (active[id]) {
		clearInterval(active[id].timer);
		delete active[id];
	}
	const timer = setInterval(() => {
		if (data.isStopped || !database.client) return;
		active[id].stage++;
		if (!group.cache.titleAnimation[active[id].stage]) active[id].stage = 0;
		bot.telegram.setChatTitle(id, group.cache.titleAnimation[active[id].stage]);
	}, Math.round(group.cache.titleAnimationSpeed * 1000));
	active[id] = {
		timer: timer,
		titleAnimation: group.cache.titleAnimation,
		titleAnimationSpeed: group.cache.titleAnimationSpeed,
		stage: 0,
	};
}

export async function SetAnimations() {
	const grp = await getRegisteredGroups();
	for (const group of grp) {
		if (
			group?.cache?.titleAnimation[0] &&
			group.cache?.titleAnimationSpeed?.toFixed &&
			group.cache.titleAnimationSpeed >= 5 &&
			group.cache.titleAnimationSpeed <= 1000 &&
			!(
				active[group.static.id] &&
				active[group.static.id].titleAnimation == group?.cache?.titleAnimation &&
				active[group.static.id].titleAnimationSpeed == group.cache?.titleAnimationSpeed
			)
		)
			Animate(group);
	}
}

SetAnimations();

import { message } from "telegraf/filters";
import { bot, data, database, tables } from "../../index.js";

bot.on(message("new_chat_title"), (ctx, next) => {
	ctx.deleteMessage(ctx.message.message_id);
	next();
});

/**
 * @type {Record<string, {
 *   timer: NodeJS.Timer;
 *   titleAnimation: string[];
 *   titleAnimationSpeed: number;
 *   stage: number;
 * }>}
 */
const ACTIVE = {};

/**
 *
 * @param {DB.Group} group
 */
function Animate(group) {
	const id = group.static.id;
	if (ACTIVE[id]) {
		clearInterval(ACTIVE[id].timer);
		delete ACTIVE[id];
	}
	const timer = setInterval(() => {
		if (data.isStopped || database.closed) return;
		ACTIVE[id].stage++;
		if (!group.cache.titleAnimation[ACTIVE[id].stage]) ACTIVE[id].stage = 0;
		bot.telegram.setChatTitle(id, group.cache.titleAnimation[ACTIVE[id].stage]);
	}, Math.round(group.cache.titleAnimationSpeed * 1000));
	ACTIVE[id] = {
		timer: timer,
		titleAnimation: group.cache.titleAnimation,
		titleAnimationSpeed: group.cache.titleAnimationSpeed,
		stage: 0,
	};
}

export async function SetAnimations() {
	const groups = Object.values(tables.groups.collection());
	for (const group of groups) {
		if (
			group?.cache?.titleAnimation[0] &&
			group.cache?.titleAnimationSpeed?.toFixed &&
			group.cache.titleAnimationSpeed >= 5 &&
			group.cache.titleAnimationSpeed <= 1000 &&
			!ACTIVE[group.static.id]
		)
			Animate(group);
	}
}

SetAnimations();

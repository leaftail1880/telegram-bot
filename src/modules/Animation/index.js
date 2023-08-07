import { LeafyDBTable } from "leafy-db";
import { message } from "telegraf/filters";
import { bot, database } from "../../index.js";

bot.on(message("new_chat_title"), (ctx, next) => {
	ctx.deleteMessage(ctx.message.message_id);
	next();
});

/**
 * @type {Record<string, {timer: NodeJS.Timer, stage: number}>}
 */
const ANIMATORS = {};

/**
 * @typedef {{
 *   titles: string[],
 *   interval: number
 * }} AnimationSettings
 */

/**
 * @type {LeafyDBTable<AnimationSettings>}
 */
const DB = database.table("modules/animate.json");

process.on("modulesLoad", () => {
	for (const [id, options] of Object.entries(DB.collection())) {
		ANIMATORS[id] = {
			timer: setInterval(() => {
				let title = options.titles[ANIMATORS[id].stage++];
				if (!title) {
					ANIMATORS[id].stage = 0;
					title = options.titles[0];
				}

				bot.telegram.setChatTitle(id, title);
			}, options.interval),
			stage: 0,
		};
	}
});

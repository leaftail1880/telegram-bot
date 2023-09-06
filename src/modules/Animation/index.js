import { LeafyDBTable } from "leafy-db";
import { LeafyLogger } from "leafy-utils";
import { Hemisphere, Moon } from "lunarphase-js";
import { message } from "telegraf/filters";
import { bot, database } from "../../index.js";

/**
 * @typedef {{
 *   lunar: string;
 *   update: number;
 * }} AnimationSettings
 *
 * @type {LeafyDBTable<AnimationSettings>}
 */
const DB = database.table("modules/animate.json");

process.on("modulesLoad", () => {
	for (const [id, options] of Object.entries(DB.collection())) {
		consistentUpdate(id, options);
	}
});

const TIMEOUT_LIMIT = 1000 * 60 * 30;

/**
 * Consistently update chat title
 * @param {string} id
 * @param {AnimationSettings} options
 */
function consistentUpdate(id, options) {
	options.update ??= 0;
	// Time remains to update
	const remaining = Date.now() - options.update;
	if (remaining > 0) {
		// Update time was before
		setLunarTitle(id, options.lunar);

		// Create new update time
		const date = new Date();
		date.setHours(0, 0, 0, 0);
		date.setDate(date.getDate() + 1);
		options.update = Math.round(date.getTime());
		consistentUpdate(id, options);
		DB.set(id, options);

		// No update, wait for them
	} else {
		const actualTime = -remaining + 1000;
		setTimeout(
			() => consistentUpdate(id, options),
			// For some reason big time like 20 hours will not even trigger
			Math.min(TIMEOUT_LIMIT, actualTime)
		);
	}
}

bot.on(message("new_chat_title"), (ctx, next) => {
	if (ctx.from.id === ctx.botInfo.id) ctx.deleteMessage(ctx.message.message_id);
	next();
});

/**
 * @param {string} id
 * @param {string} text
 */
function setLunarTitle(id, text) {
	logger.log("New phase set");
	bot.telegram.setChatTitle(
		id,
		`${Moon.lunarPhaseEmoji(new Date(), {
			hemisphere: Hemisphere.NORTHERN,
		})} ${text ?? ""}`
	);
}

const logger = new LeafyLogger({ prefix: "lunar" });

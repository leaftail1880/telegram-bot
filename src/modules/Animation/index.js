import { LeafyDBTable } from "leafy-db";
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

/**
 * Consistently update chat title
 * @param {string} id
 * @param {AnimationSettings} options
 */
function consistentUpdate(id, options, fromTimeout = false) {
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
	} else
		setTimeout(() => consistentUpdate(id, options, true), -remaining + 1000);
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
	console.log(
		new Date().toLocaleString([], {
			hourCycle: "h24",
		}),
		"Lunar phase check"
	);
	bot.telegram.setChatTitle(
		id,
		`${Moon.lunarPhaseEmoji(new Date(), {
			hemisphere: Hemisphere.NORTHERN,
		})} ${text ?? ""}`
	);
}

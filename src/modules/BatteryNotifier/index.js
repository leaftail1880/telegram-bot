import { exec } from "leafy-utils";
import { bot, data } from "../../index.js";
import { on } from "../../lib/Class/Events.js";

/**
 *
 * @returns {Promise<{
 *  health: string,
 *  percentage: number,
 *  plugged: string,
 *  status: string,
 *  temperature: number,
 *  current: number
 * } | 'NOT_A_PHONE'>}
 */
async function getStatus() {
	try {
		return JSON.parse((await exec("termux-battery-status")).stdout);
	} catch {
		return "NOT_A_PHONE";
	}
}

let notified = false;
on("load.modules", async () => {
	const status = await getStatus();

	if (status === "NOT_A_PHONE") {
		bot.telegram.sendMessage(
			data.chatID.log,
			"Статус зарядки не отслеживается."
		);
		return;
	}

	const notify = async () => {
		const status = await getStatus();

		if (status === "NOT_A_PHONE") return;

		// Check if phone need dont need a charge
		if (
			(status.percentage < 40 && status.status === "CHARGING") ||
			(status.percentage > 70 && status.status !== "CHARGING")
		) {
			// Phone doesnt need a charge, skip
			notified = false;
			return;
		}

		// We already notified, so now dont spam
		if (notified) return;

		bot.telegram.sendMessage(
			data.chatID.log,
			status.percentage < 40
				? "Телефон требуется зарядить."
				: status.percentage > 70
				? "Телефон можно снять с зарядки."
				: "Error231"
		);
		notified = true;
	};

	notify();

	setInterval(notify, 1000 * 60 * 60);

	data.notify = notify;
	data.getStatus = getStatus;
});

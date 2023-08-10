import { exec } from "leafy-utils";
import { bot, Service } from "../../index.js";

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
process.on("modulesLoad", async () => {
	const status = await getStatus();

	if (status === "NOT_A_PHONE" && !Service.development) {
		bot.telegram.sendMessage(
			Service.chat.log,
			"Статус зарядки не отслеживается."
		);
		return;
	}

	const notify = async () => {
		const status = await getStatus();

		if (status === "NOT_A_PHONE") return;

		// Check if phone don't need a charge
		if (
			(status.percentage < 40 && status.status === "CHARGING") ||
			(status.percentage > 70 && status.status !== "CHARGING")
		) {
			notified = false;
			return;
		}

		// We already notified, so now don't spam
		if (notified) return;

		bot.telegram.sendMessage(
			Service.chat.log,
			(status.percentage < 40
				? "Телефон требуется зарядить. ("
				: status.percentage > 70
				? "Телефон можно снять с зарядки. ("
				: "40 < perc < 70: ") +
				status.percentage +
				"%)"
		);
		notified = true;
	};

	notify();

	setInterval(notify, 1000 * 60 * 30);
});

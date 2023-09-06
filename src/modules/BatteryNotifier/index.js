import child_process from "child_process";
import util from "util";
import { bot, Service } from "../../index.js";

const exec = util.promisify(child_process.exec);

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
		const battery = await getStatus();

		if (battery === "NOT_A_PHONE") return;

		// Check if phone don't need a charge
		if (
			(battery.percentage < 40 && battery.status === "CHARGING") ||
			(battery.percentage > 70 && battery.status !== "CHARGING")
		) {
			notified = false;
			return;
		}

		// We already notified, so now don't spam
		if (notified) return;

		bot.telegram.sendMessage(
			Service.chat.log,
			battery.percentage < 40
				? `Телефон требуется зарядить. (${battery.percentage}%)`
				: battery.percentage > 70
				? `Телефон можно снять с зарядки. (${battery.percentage}%)`
				: `40 < percentage < 70: ${battery.percentage}, status: ${battery.status}, notified: ${notified}`
		);
		notified = true;
	};

	notify();

	setInterval(notify, 1000 * 60 * 30);
});

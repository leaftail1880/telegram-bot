import { Xitext } from "../Class/Xitext.js";
import { SERVISE, log } from "../SERVISE.js";

/**
 *
 * @param {string} runnerName
 * @param {Function} callback
 * @param {Xitext | string} dataOnError
 * @param {Xitext | string} dataOnSuccesfull
 * @returns
 */
export function safeRun(
	runnerName,
	callback,
	dataOnError,
	dataOnSuccesfull,
	sendMessage = true
) {
	try {
		const result = callback();
		if (result?.catch)
			result.catch((e) => {
				SERVISE.error({
					name: `Promise ${runnerName} error: `,
					message: e.message + dataOnError,
					stack: e.stack,
				});
			});
		let txt = `> ${runnerName}. `;

		/** @type {import("telegraf").Types.ExtraReplyMessage} */
		let extra = {};
		if (typeof dataOnSuccesfull === "string" || !dataOnSuccesfull._.build) {
			txt += dataOnSuccesfull;
		} else {
			const temp = dataOnSuccesfull._.build({}, txt.length);
			txt += temp[0];
			extra = temp[1];
		}
		extra.disable_notification = true;
		if (sendMessage) log(txt, extra);
		return true;
	} catch (error) {
		SERVISE.error({
			name: `${runnerName} error: `,
			message: error.message + dataOnError,
			stack: error.stack,
		});
		return false;
	}
}

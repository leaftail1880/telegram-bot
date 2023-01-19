import { Service } from "../../index.js";

/**
 *
 * @param {Function} callback
 * @param {string} runnerName
 * @returns
 */
export async function safeRun(runnerName, callback) {
	try {
		await callback();
		return true;
	} catch (error) {
		Service.error({
			name: `${runnerName} error: `,
			message: error.message,
			stack: error.stack,
		});
		return false;
	}
}

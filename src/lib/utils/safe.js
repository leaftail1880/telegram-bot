import clc from "cli-color";
import { Service } from "../../index.js";
import styles from "../styles.js";

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

/**
 * It loads all the files in a folder and logs the time it took to load each file
 * @param {string[]} folderArray - An array of folders to load.
 * @param {(file: string) => Promise<void | {wait: Promise<void>}>} importFN - The folder that the files are in.
 */
export async function safeLoad(folderArray, importFN, log = true) {
	for (const file of folderArray) {
		try {
			const start = performance.now();

			const module = await importFN(file);
			if (module && "wait" in module) await module.wait;

			if (log)
				console.log(`${styles.load}${file} (${clc.yellowBright(`${(performance.now() - start).toFixed(2)} ms`)})`);
		} catch (e) {
			console.log(`${styles.loadError}${file}`);
			Service.error(e);
		}
	}
}

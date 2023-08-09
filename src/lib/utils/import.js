import { Service } from "../../index.js";
import styles from "../styles.js";

/**
 * It loads all the files in a folder and logs the time it took to load each file
 * @param {string[]} folderArray - An array of folders to load.
 * @param {(file: string) => Promise<void | {wait: Promise<void>}>} importFN - Function that loads.
 */
export async function importMultiple(folderArray, importFN, log = true) {
	for (const file of folderArray) {
		try {
			const start = performance.now();

			const module = await importFN(file);
			if (module && "wait" in module) await module.wait;

			if (log)
				console.log(
					`${styles.load}${file} (${styles.number(
						`${(performance.now() - start).toFixed(2)} ms`
					)})`
				);
		} catch (e) {
			console.log(`${styles.loadError}${file}`);
			await Service.error(e);
			Service.stop("Error while loading", "ALL", false);
			throw new Error("Stop");
		}
	}
}

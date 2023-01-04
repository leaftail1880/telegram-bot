import * as fs from "fs";
import { database } from "../../index.js";
import { d } from "../../lib/Class/Utils.js";

/**
 * @type {1 | 2 | 0} 1 - from, 2 - to, 0 - not
 */
const from = 0;

(async () => {
	// @ts-ignore
	if (from === 1) {
		const OCS = (await database.getActualData(d.pn("Module", "OC"), true)) ?? {};
		Object.keys(OCS).forEach((e) => {
			const ar = OCS[e] ?? [];
			OCS[e] = ar.filter((e) => e);
			if (!OCS[e][0]) delete OCS[e];
		});

		fs.writeFile("migration.json", JSON.stringify(OCS), (err) => console.warn(err));
	} else {
		fs.readFile("migration.json", async (err, data) => {
			if (err) console.warn(err);

			/**
			 * @type {Object<string, object>}
			 */
			const values = JSON.parse(data.toString());
			console.log("succ");

			for (const [key, value] of Object.entries(values)) {
				console.log(key);
				await database.set(d.pn("oc", key), value);
			}
		});
	}
})();

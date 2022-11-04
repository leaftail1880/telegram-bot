import * as fs from "fs";
import { database } from "../../index.js";

/**
 * @type {1 | 2 | 0} 1 - from, 2 - to, 0 - not
 */
const from = 0;

(async () => {
  // @ts-ignore
  if (from === 1) {
    const values = await database.getPairs();

    fs.writeFile("migration.json", JSON.stringify(values), (err) =>
      console.warn(err)
    );
  } else {
    fs.readFile("migration.json", async (err, data) => {
      if (err) console.warn(err);

      /**
       * @type {Object<string, object>}
       */
      const values = JSON.parse(data.toString());

      for (const [key, value] of Object.entries(values)) {
        await database.set(key, value);
      }
    });
  }
})();

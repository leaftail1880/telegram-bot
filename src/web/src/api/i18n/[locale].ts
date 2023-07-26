export const GET: Route = (req) => {
  const table = Object.fromEntries(Object.entries(db).map(([key, langs]) => {
    return [key, langs[req.params.locale ?? "en"]]
  }))
  return {c: codeLocale, db: table}
};

import fs from "fs/promises";
import path from "path";
import url from "url";

const __dirname = path.join(
	path.dirname(url.fileURLToPath(import.meta.url)),
	import.meta.env.PROD ? "" : "../"
);
let db: import("leafy-i18n").i18nDB = {};
let codeLocale = "en"

async function init() {
  db = JSON.parse(
		await fs.readFile(
			path.join(__dirname, "../../i18n/translation.json"),
			"utf-8"
		)
	);
  codeLocale = JSON.parse(
		await fs.readFile(path.join(__dirname, "../../i18n/config.json"), "utf-8")
	).codeLocale;
}

init();

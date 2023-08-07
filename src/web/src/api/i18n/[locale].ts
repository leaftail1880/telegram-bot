import fs from "fs/promises";
import path from "path";
import { SERVER_DIR } from "../../server/utils.js";
let db: import("leafy-i18n").i18nDB = {};
let codeLocale = "en";

export const GET: Route = (req) => {
	const table = Object.fromEntries(
		Object.entries(db).map(([key, langs]) => {
			return [key, langs[req.params.locale ?? "en"]];
		})
	);
	return { c: codeLocale, db: table };
};

async function main() {
	db = JSON.parse(
		await fs.readFile(
			path.resolve(SERVER_DIR, "../../i18n/translation.json"),
			"utf-8"
		)
	);
	codeLocale = JSON.parse(
		await fs.readFile(
			path.resolve(SERVER_DIR, "../../i18n/config.json"),
			"utf-8"
		)
	).codeLocale;
}

main();

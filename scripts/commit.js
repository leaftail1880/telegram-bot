// @ts-check

import fs from "fs/promises";
import { Commiter } from "leafy-utils";

Commiter.precommit = async function ({ version, prev_version }) {
	console.log(prev_version.join("."), "->", version.join("."));

	const config_path = "./src/config.js";

	let config = (await fs.readFile(config_path)).toString();

	config = config.replace(
		/version:(\s*)\[.+\],/m,
		`version:$1[${version.join(", ")}],`
	);

	await fs.writeFile(config_path, config);
};

async function main() {
	Commiter.add_commit_push(await Commiter.checkForCommitArgs());
}

main();

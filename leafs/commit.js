import { commiter } from "leafy-utils";
import fs from "fs/promises";

commiter.on("before_commit", async ({ version, suffix, type, prev_version }) => {
	console.log(prev_version.join("."), "->", version.join("."));

	const config_path = "./src/config.js";

	let config = (await fs.readFile(config_path)).toString();

	config = config.replace(/version:(\s*)\[.+\],/m, `version:$1[${version.join(", ")}],`);

	await fs.writeFile(config_path, config);
});

commiter.emit("commit", { silentMode: false });
// commiter.emit("after_commit", { version: [8, 1, 25] });

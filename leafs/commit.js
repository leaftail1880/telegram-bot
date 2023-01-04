import { commiter } from "leafy-utils";

commiter.on("after_commit", async ({ version, suffix, type, prev_version }) => {
	console.log(prev_version.join("."), "->", version.join("."));
});

commiter.emit("commit", { silentMode: false });

import { botApiEnv, botApiLink, botHostExpose } from "./utils.js";
async function main() {
	botApiEnv();
	await botApiLink();
	botHostExpose();
	process.env.CLIENT_DIR = "./dist/client/";
	// @ts-ignore
	process.env.PORT = 8888;
	// @ts-ignore
	await import("../../dist/server/app.js");
}

if (process.argv[2] !== "host") main();
else botHostExpose();

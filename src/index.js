export * from "./lib/launch/telegraf.js";

export * from "./lib/launch/database.js";
export * from "./lib/Service.js";

import { socksDispatcher } from "fetch-socks";
import { Service } from "./lib/Service.js";

const proxyUrl = process.env.DISCORD_SOCKS_PROXY_URL;

import undici from "undici";

if (proxyUrl) {
	globalThis.fetch = undici.fetch;
	const { hostname, port } = new URL(proxyUrl);
	console.log(`Using global proxy at hostname=${hostname}, port=${port}`);
	const agent = socksDispatcher({
		type: 5,
		host: hostname,
		port: parseInt(port),
	});
	undici.setGlobalDispatcher(agent);
}

// Global error handlers
process.on("unhandledRejection", Service.handlers.processError);
process.on("uncaughtException", Service.handlers.processError);

// Gracefull stop
process.once("SIGINT", () => Service.stop("SIGINT", "ALL"));
process.once("SIGTERM", () => Service.stop("SIGTERM", "ALL"));

// All done, start
Service.start().catch((e) => {
	Service.error(e);
	process.exit(1);
});

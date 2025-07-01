export * from "./lib/launch/telegraf.js";

export * from "./lib/launch/database.js";
export * from "./lib/Service.js";

import { Service } from "./lib/Service.js";

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

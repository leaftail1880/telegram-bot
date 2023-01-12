import "dotenv/config.js";

import { RedisDatabase } from "./lib/launch/db.js";
import { handlers, Service } from "./lib/Service.js";

/**
 * Typed bind
 * @template {Function} Func
 * @template This
 * @param {Func} func
 * @param {This} context
 * @returns {Func}
 */
export function BIND(func, context) {
	if (typeof func !== "function") return func;
	return func.bind(context);
}

// Database
export const database = new RedisDatabase();

// Global error handlers
process.on("unhandledRejection", handlers.processError);
process.on("uncaughtException", handlers.processError);

// Gracefull stop
process.once("SIGINT", () => Service.stop("SIGINT", "ALL"));
process.once("SIGTERM", () => Service.stop("SIGTERM", "ALL"));

// All done, start
Service.start();

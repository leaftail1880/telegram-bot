import { RedisDatabase } from "./lib/launch/db.js";
import { handlers, SERVISE } from "./lib/SERVISE.js";

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

// Global error handler
process.on("unhandledRejection", handlers.processError);

// Gracefull stop
process.once("SIGINT", () => SERVISE.stop("SIGINT", "ALL"));
process.once("SIGTERM", () => SERVISE.stop("SIGTERM", "ALL"));

// All done, start
SERVISE.start();

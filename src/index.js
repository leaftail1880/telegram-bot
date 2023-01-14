import "dotenv/config.js";
export * from "./lib/launch/tg.js";

import { env } from "./lib/launch/tg.js";
import { RedisDatabase } from "./lib/Class/Database.js";
import { handlers, Service } from "./lib/Service.js";

export const database = new RedisDatabase(env.REDIS_URL);
export const tables = {
	Users: database._.createTable("Users"),
};

// Global error handlers
process.on("unhandledRejection", handlers.processError);
process.on("uncaughtException", handlers.processError);

// Gracefull stop
process.once("SIGINT", () => Service.stop("SIGINT", "ALL"));
process.once("SIGTERM", () => Service.stop("SIGTERM", "ALL"));

// All done, start
Service.start();

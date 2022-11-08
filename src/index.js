import { RedisDatabase } from "./lib/launch/db.js";
import { handlers, SERVISE } from "./lib/SERVISE.js";

// Database
export const database = new RedisDatabase();

// Global error handler
process.on("unhandledRejection", handlers.processError);

// Gracefull stop
process.once("SIGINT", () => SERVISE.stop("SIGINT"));
process.once("SIGTERM", () => SERVISE.stop("SIGTERM"));

// All done, start
SERVISE.start();

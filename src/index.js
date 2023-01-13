import "dotenv/config.js";

if (!process.env.TOKEN || !process.env.REDIS_URL) throw new TypeError("No tokens found");

import { Telegraf } from "telegraf";
import { RedisDatabase } from "./lib/Class/Database.js";
import { handlers, Service } from "./lib/Service.js";

/** @type {IEnv} */
//@ts-expect-error We already checked this, trust me TS
export const env = process.env;

export const bot = new Telegraf(env.TOKEN);

export const database = new RedisDatabase();

// Global error handlers
process.on("unhandledRejection", handlers.processError);
process.on("uncaughtException", handlers.processError);

// Gracefull stop
process.once("SIGINT", () => Service.stop("SIGINT", "ALL"));
process.once("SIGTERM", () => Service.stop("SIGTERM", "ALL"));

// All done, start
Service.start();

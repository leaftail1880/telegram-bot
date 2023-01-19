import "dotenv/config.js";
import { DatabaseManager, DatabaseWrapper } from "leafy-db";
export * from "./lib/launch/tg.js";

import { env } from "./lib/launch/tg.js";
import { handlers, Service } from "./lib/Service.js";

const Manager = new DatabaseManager({
	repositoryURL: env.DB_REPO,
	token: env.DB_TOKEN,
	username: "leaftail1880",
});
export const database = Manager.Database;

export const tables = {
	/** @type {DatabaseWrapper<DB.User>} */
	users: Manager.CreateTable("users.json"),

	/** @type {DatabaseWrapper<DB.Group>} */
	groups: Manager.CreateTable("groups.json"),
};

// Global error handlers
process.on("unhandledRejection", handlers.processError);
process.on("uncaughtException", handlers.processError);

// Gracefull stop
process.once("SIGINT", () => Service.stop("SIGINT", "ALL"));
process.once("SIGTERM", () => Service.stop("SIGTERM", "ALL"));

// All done, start
Service.start();

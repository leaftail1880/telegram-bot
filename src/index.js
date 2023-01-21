import { DatabaseManager, DatabaseWrapper } from "leafy-db";

export * from "./lib/launch/telegraf.js";
export * from "./lib/Service.js";

import { env } from "./lib/launch/telegraf.js";
import { Service } from "./lib/Service.js";

export const DBManager = new DatabaseManager({
	repositoryURL: env.DB_REPO,
	token: env.DB_TOKEN,
	username: "leaftail1880",
});
export const database = DBManager.Database;

export const tables = {
	/** @type {DatabaseWrapper<DB.User>} */
	users: DBManager.CreateTable("users.json"),

	/** @type {DatabaseWrapper<DB.Group>} */
	groups: DBManager.CreateTable("groups.json"),
};

// Global error handlers
process.on("unhandledRejection", Service.handlers.processError);
process.on("uncaughtException", Service.handlers.processError);

// Gracefull stop
process.once("SIGINT", () => Service.stop("SIGINT", "ALL"));
process.once("SIGTERM", () => Service.stop("SIGTERM", "ALL"));

// All done, start
Service.start();

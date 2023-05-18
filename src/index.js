import { DatabaseManager, DatabaseWrapper } from "leafy-db";

export * from "./lib/launch/telegraf.js";
export * from "./lib/Service.js";

import { env } from "./lib/launch/telegraf.js";
import { Service } from "./lib/Service.js";

export const database = new DatabaseManager({
	repository: {
		branch: "master",
		ns: "github",
		owner: env.DB_USERNAME,
		repo: env.DB_REPO,
	},
	username: env.DB_USERNAME,
	token: env.DB_TOKEN,
});

export const tables = {
	/** @type {DatabaseWrapper<DB.User>} */
	users: database.CreateTable("users.json"),

	/** @type {DatabaseWrapper<DB.Group>} */
	groups: database.CreateTable("groups.json"),
};

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


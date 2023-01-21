import "dotenv/config.js";
import { Telegraf } from "telegraf";
export * from "telegraf";

if (!process.env.TOKEN || !process.env.DB_TOKEN || !process.env.DB_REPO)
	throw new ReferenceError("No tokens in env found!");

if (process.argv[2] === "dev") process.env.dev = "true";

/** @type {IEnv} */
//@ts-ignore
export const env = process.env;

/** @type {Telegraf<DataContext>} */
export const bot = new Telegraf(env.TOKEN);

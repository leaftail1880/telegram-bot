import dotenv from "dotenv";
import { Telegraf } from "telegraf";
export * from "telegraf";
export * from "telegraf/filters";
export * from "telegraf/format";
export * from "telegraf/future";

const ENV_PATH = process.argv[2] ?? ".env"
dotenv.config({path: ENV_PATH})

if (!process.env.TOKEN || !process.env.DB_TOKEN || !process.env.DB_REPO) {
	throw new Error(`No TOKEN in env on ${ENV_PATH} found!`);
}


/** @type {Telegraf<DataContext>} */
export const bot = new Telegraf(process.env.TOKEN);

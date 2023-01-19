import "dotenv/config.js";
import { Telegraf, Context } from "telegraf";

if (!process.env.TOKEN || !process.env.DB_TOKEN || !process.env.DB_REPO)
	throw new ReferenceError("No tokens in env found!");

/** @type {IEnv} */
//@ts-ignore
export const env = process.env;

/** @type {Telegraf<{data: State} & Context>} */
export const bot = new Telegraf(env.TOKEN);

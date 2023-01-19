import "dotenv/config.js";
import { Telegraf, Context } from "telegraf";

if (!process.env.TOKEN || !process.env.REDIS_URL) throw new TypeError("No tokens found");

/** @type {IEnv} */
//@ts-ignore
export const env = process.env;

/** @type {Telegraf<{data: State} & Context>} */
export const bot = new Telegraf(env.TOKEN);

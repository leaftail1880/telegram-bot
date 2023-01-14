import "dotenv/config.js";
import { Telegraf } from "telegraf";

if (!process.env.TOKEN || !process.env.REDIS_URL) throw new TypeError("No tokens found");

/** @type {IEnv} */
//@ts-ignore
export const env = process.env;
export const bot = new Telegraf(env.TOKEN);

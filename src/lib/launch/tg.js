import "dotenv/config";
import { Telegraf } from "telegraf";

if (!process) throw new TypeError("Cannot access to global process variable");

if (!process.env) throw new TypeError("Cannot acces to .env");

if (!process.env.TOKEN || !process.env.REDIS_URL) throw new TypeError("No tokens found");

/** @type {IEnv} */
//@ts-expect-error We already checked this, trust me TS
export const env = process.env;

export const bot = new Telegraf(env.TOKEN);

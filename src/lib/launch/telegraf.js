import { Telegraf } from "telegraf-hardened";
import { fetchWithProxy } from "../proxy.js";
import { ENV_PATH } from "../utils/env.js";
export * from "telegraf-hardened";
export * from "telegraf-hardened/filters";
export * from "telegraf-hardened/format";
export * from "telegraf-hardened/future";

if (!process.env.TOKEN || !process.env.DB_TOKEN || !process.env.DB_REPO) {
	throw new Error(`No TOKEN in env on ${ENV_PATH} found!`);
}

/** @type {Telegraf<DataContext>} */
export const bot = new Telegraf(process.env.TOKEN, {
	telegram: {
		fetch: fetchWithProxy,
	},
});

import "dotenv/config";
import { Telegraf } from "telegraf";

if (!process) throw new TypeError("Нет глобальной переменной process");

if (!process.env) throw new TypeError("Нет .env");

if (!process.env.TOKEN || !process.env.REDIS_URL)
  throw new TypeError("Нет токенов");

/**
 * @typedef {Object} MEMBERS
 * @property {number} xiller
 * @property {number} dot
 * @property {number} hloya
 */

/**======================
 * Инициализация процессов
 *========================**/
export const bot = new Telegraf(process.env.TOKEN);
// @ts-ignore
export const env = process.env;
/*========================*/

import "dotenv/config";
import { Telegraf } from "telegraf";

if (!process || !process.env || !process.env.TOKEN)
  throw new Error("Нет доступа к process.env или токену");

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

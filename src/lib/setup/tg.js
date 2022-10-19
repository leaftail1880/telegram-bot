import "dotenv/config";
import express from "express";
import { Telegraf } from "telegraf";

if (!process || !process.env || !process.env.TOKEN)
  throw new Error("Нет доступа к process.env или токену");

/**
 * @typedef {Object} environment
 * @property {String} TOKEN
 * @property {String} REDIS_URL
 * @property {String} whereImRunning
 * @property {String} CUSTOM_MEMBERS
 * @property {String | undefined} local
 * @property {String | undefined} xillerPC
 * @property {String | undefined} logGroupId
 */

/**
 * @typedef {Object} MEMBERS
 * @property {Number} xiller
 * @property {Number} dot
 * @property {Number} hloya
 */

/**======================
 * Инициализация процессов
 *========================**/
export const app = express();
export const bot = new Telegraf(process.env.TOKEN);
/**
 * @type {environment}
 */
export const env = process.env;
let member = {};
env.CUSTOM_MEMBERS.split(",").forEach((e) => {
  member[e.split(":")[0]] = Number(e.split(":")[1]);
});
/**
 * @type {MEMBERS}
 */
export const members = member;
/*========================*/

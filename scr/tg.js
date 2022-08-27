import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
const a = dotenv.config().parsed
import express from "express";
import { Telegraf } from "telegraf";

if (!a || !a.TOKEN) throw new Error('Нет доступа к .env или токену')

/**======================
 * Инициализация процессов
 *========================**/
export const app = express();
export const bot = new Telegraf(a.TOKEN);
export const env = a;
/*========================*/

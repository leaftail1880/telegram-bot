import "dotenv/config";
import express from "express";
import { Telegraf } from "telegraf";

if (!process || process.env || !process.env.TOKEN) throw new Error('Нет доступа к process.env или токену')

/**======================
 * Инициализация процессов
 *========================**/
export const app = express();
export const bot = new Telegraf(process.env.TOKEN);
export const env = process.env;
/*========================*/

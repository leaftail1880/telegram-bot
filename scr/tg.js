import "dotenv/config";
import express from "express";
import { Telegraf } from "telegraf";

/**======================
 * Инициализация процессов
 *========================**/
export const app = express();
export const bot = new Telegraf(process.env.TOKEN);
export const env = process.env;
/*========================*/

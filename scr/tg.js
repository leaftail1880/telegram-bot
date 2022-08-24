import "dotenv/config";
import express from "express";
import { Telegraf } from "telegraf";



// node app
// nodemon app
export let VERSION = [6, 0, 45]

/**======================
 * Инициализация процессов
 *========================**/
export const app = express();
export const bot = new Telegraf(process.env.TOKEN);
export const env = process.env
/*========================*/
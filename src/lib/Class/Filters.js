import { message, callbackQuery } from "telegraf/filters";
export const isText = message("text");
export const isQuery = callbackQuery("data");

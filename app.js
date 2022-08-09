import express from "express";
import { MEMBERS, PORT } from "./config.js";
import { Telegraf } from "telegraf";
import 'dotenv/config'
// node app
// nodemon app


const app = express();
const bot = new Telegraf(process.env.TOKEN);

export function stringifyEx(startObject, space = undefined) {
    let unsafeProperty = "unsafeproperty.fixed";
    function getString(ThisObject, before, isSpace) {
      switch (typeof ThisObject) {
        case "function":
          return `function ${ThisObject.name ?? ""}(${ThisObject.length} args)`;
        case "object":
          if (ThisObject == null) {
            return "null";
          }
          if (!Object.entries(ThisObject).length) {
            return "{}";
          }
          if (!ThisObject[unsafeProperty]) {
            let isArray = Array.isArray(ThisObject);
            let ReturnString = isArray ? "[" : "{";
            let First = false;
            let nextS = before + "" + (space ?? "");
            ThisObject[unsafeProperty] = true;
            for (const key in ThisObject) {
              if (key == unsafeProperty) {
                continue;
              }
              try {
                ReturnString +=
                  (First ? "," : "") +
                  "" +
                  (isSpace ? "\n" : "") +
                  nextS +
                  (isArray ? "" : `"${key}":${isSpace ? " " : ""}`) +
                  getString(ThisObject[key], nextS, isSpace);
              } catch (error) {}
              First = true;
            }
            ThisObject[unsafeProperty] = undefined;
            return (
              ReturnString +
              "" +
              (space ?? false ? "\n" + before : "") +
              (isArray ? "]" : "}")
            );
          } else {
            return "{...}";
          }
        default:
          return JSON.stringify(ThisObject);
      }
    }
    return getString(startObject, "", space ?? "" != "");
  }
  
/**
 * Convert Durations to milliseconds
 */
function toMS(value) {
    const number = Number(value.replace(/[^-.0-9]+/g, ""));
    value = value.replace(/\s+/g, "");
    if (/\d+(?=y)/i.test(value)) return number * 3.154e10;
    else if (/\d+(?=w)/i.test(value)) return number * 6.048e8;
    else if (/\d+(?=d)/i.test(value)) return number * 8.64e7;
    else if (/\d+(?=h)/i.test(value)) return number * 3.6e6;
    else if (/\d+(?=m)/i.test(value)) return number * 60000;
    else if (/\d+(?=s)/i.test(value)) return number * 1000;
    else if (/\d+(?=ms|milliseconds?)/i.test(value)) return number;
  }
/**
 * Выводит время в формате 00:00
 * @returns {String}
 */
function shortTime() {
  const time = Number(String(new Date(Date())).split(" ")[4].split(":")[0]),
    min = String(new Date(Date())).split(" ")[4].split(":")[1];
  return `${time}:${min.length == 2 ? min : "0" + min}`;
}
/**
 * Выводит время в формате [6, 0]
 * @returns {Array<Number>}
 */
 function ArrrayTime() {
    const time = Number(String(new Date(Date())).split(" ")[4].split(":")[0]),
      min = Number(String(new Date(Date())).split(" ")[4].split(":")[1]);
    return [time, min]
  }

bot.start((ctx) => {
  ctx.reply("Кобольдя очнулся");
});

bot.command("test", (ctx) => {
  if (ctx.message.text.startsWith('.')) return
  const ogr = MEMBERS[ctx.message.from.id];
  if (!ogr) return
  //ctx.reply('Дата:\n'+ stringifyEx(ogr, ' '))
  const time = ArrrayTime()
  time[0] = time[0] + ogr.msk ?? 0

  const t = new Date()
  t.setHours(time[0])
  const s = new Date()
  s.setHours(ogr.start[0], ogr.start[1], 0, 0)
  if (s.getHours() == 0) s.setMilliseconds(-1)
  const e = new Date()
  e.setHours(ogr.end[0], ogr.end[1], 0, 0)

  const tt = t.getTime()
  const ss = s.getTime()
  const ee = e.getTime()
   ctx.reply(`${s.toTimeString()}` + '\n'+ ''+ t.toTimeString()  + '\n'+ `${e.toTimeString()}`)
   ctx.reply(`${tt >= ss} ${tt <= ee}`)
  if (tt >= ss || tt <= ee) ctx.deleteMessage(ctx.message.message_id)
});

bot.command("time", (ctx) => {
  ctx.reply(shortTime());
});

// bot.on("message", (ctx) => {
//     ctx.reply(ctx.message.from.id)
//   const ogr = MEMBERS[ctx.message.from.id];
//   ctx.reply(ogr)
// });

bot.command("reg", (ctx) => {
  ctx.reply("Твой айди: " + ctx.message.from.id);
});

bot.launch();
app.listen(PORT, () => console.log(`My server is running on port ${PORT}`));



// Включить плавную остановку
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
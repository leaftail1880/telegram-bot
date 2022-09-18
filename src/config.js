import { env } from "./app/setup/tg.js";

export const VERSION = [7, 0, 3], //
  PORT = !env.xillerPC ? 3001 : Number(Date.now().toString().substring(9)),
  commandClearRegExp = /^[\.\-\+\/\$]\S+\s?/g,
  // Время в миллисекундах, которое должно пройти что бы данные пользователя обновились.
  // Чем меньше, тем дольше будет обработка сообщений при запуске.
  cacheUpdateTime = 2000,
  // Имя папки, в которой содержатся скрипты. Нужно для парсинга ошибок.
  Plugins = [
    "UpdateUser", // Обновление пользователей и групп в базах данных
    "Command", // Команды
    "timeChecker", // Время
    "OC", // Модуль для команды /oc
    "DBmanageV2",
    "Cooldowns", // Таймеры

    /*"Animation"*/
  ],
  dbkey = {
    session: "bot_session",
    version: "bot_latest_version",
    request: "bot_request",
  },
  MEMBERS = {
    // dot
    dot: {
      GMT: 2,
      start: ["02", "00"],
      end: ["05", "00"],
    },
    // Xiller
    xiller: {
      GMT: 2,
      start: ["00", "00"],
      end: ["05", "00"],
      admin: true,
    },
    // Hloya
    hloya: {
      GMT: 7,
      start: ["00", "00"],
      end: ["05", "00"],
    },
    default: {
      GMT: 0,
      start: ["00", "00"],
      end: ["05", "00"],
    },
  };

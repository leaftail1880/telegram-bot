export default {
  version: [
    8, //
    1, //
    2, //
  ],

  commandClearRegExp: /^.\w*\s?/g,

  // Время в миллисекундах, которое должно пройти что бы данные пользователя обновились.
  // Чем меньше, тем дольше будет обработка сообщений при запуске.
  cacheUpdateTime: 2000,

  // Имя папки, в которой содержатся скрипты. Нужно для парсинга ошибок.
  plugins: [
    "UpdateUser", // Обновление пользователей и групп в базах данных
    "Command", // Команды
    "OC", // Модуль для команды /oc
    "DBmanageV2",
    "Timers", // Таймеры
    // "Migrate",
    /*"Animation"*/
  ],

  dbkey: {
    session: "bot_session",
    version: "bot_latest_version",
    request: "bot_request",
  },
};

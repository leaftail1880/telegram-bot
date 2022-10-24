export default {

  VERSION: [
    8, //
    0, //
    1, //
  ],

  commandClearRegExp: /^[\.\-\+\/\$]\S+\s?/g,

  // Время в миллисекундах, которое должно пройти что бы данные пользователя обновились.
  // Чем меньше, тем дольше будет обработка сообщений при запуске.
  cacheUpdateTime: 2000,

  // Имя папки, в которой содержатся скрипты. Нужно для парсинга ошибок.
  Plugins: [
    "UpdateUser", // Обновление пользователей и групп в базах данных
    "Command", // Команды
    "OC", // Модуль для команды /oc
    "DBmanageV2",
    "Cooldowns", // Таймеры
    /*"Animation"*/
  ],

  dbkey: {
    session: "bot_session",
    version: "bot_latest_version",
    request: "bot_request",
  },
};

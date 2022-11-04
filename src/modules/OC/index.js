import { d } from "../../lib/Class/Formatter.js";
import { MultiMenuV1 } from "../../lib/Class/Menu.js";
import { Button, Xitext } from "../../lib/Class/Xitext.js";

/**
 * @typedef {Object} UserOC
 * @property {string} name
 * @property {string} description
 * @property {string} fileid
 */

export const m = new MultiMenuV1("OC"),
  link = m.link.bind(m),
  editMsg = m.editMsgFromQuery.bind(m),
  not = m.notPrivateChat.bind(m),
  cacheEmpty = (qq, lvl) => m.isCacheEmpty(qq?.user, lvl);

export const lang = {
  create: {
    name: "Теперь отправь мне имя персонажа. (Не более 32 символов)",
    description:
      "Теперь отправь мне описание персонажа. (Ссылку на тг акк в нем оставлять не надо, я делаю это за вас при поиске))",
    done: "Успешно! /oc",
  },
  /**
   *
   * @param {string} t
   * @returns
   */
  skip: (t) => `${t}\nПропустить: /next`,
  edit: {
    name: () => lang.skip(lang.create.name),
    description: () => lang.skip(lang.create.description),
  },
  mainKeyboard: [
    [new Button("Добавить").data(link("reg"))],
    [new Button("Найти").data(link("find"))],
    [new Button("Мои персонажи").data(link("my"))],
  ],
  main: new Xitext()
    .Text("Меню ")
    ._Group("OC")
    .Bold()
    .Url(null, d.guide(6))
    .Text(" (Или гифтменю):"),
  reg0: new Xitext()
    .Text(
      "Что бы прикрепить своего ОС к этому боту, отправь референс ОС ввиде "
    )
    ._Group("файла")
    .Bold()
    .Url(null, d.guide(5))
    ._Group()
    .Text("\n Что бы выйти из этого пошагового меню используй команду /cancel"),
  edit0: new Xitext()
    .Text("Отправь новый референс персонажа ввиде ")
    ._Group("файла")
    .Bold()
    .Url(null, d.guide(5))
    ._Group()
    .Text(
      "\n\n Если хочешь оставить прошлый референс, используй /next\n Что бы выйти из этого пошагового меню используй команду /cancel"
    ),
  maxLength: (type, length) =>
    new Xitext()
      .Text(`${type} должно быть `)
      ._Group("НЕ")
      .Bold()
      ._Group()
      .Text(` больше ${length} символов в длину`)
      ._Build(),
  find: "Список владельцев ОС",
  userOCS: (name) => `Персонажи ${name}`,
  myOCS: "Ваши персонажи",
  OC: (name, description, ownerName, owner) =>
    new Xitext()
      ._Group(name)
      .Bold()
      .Url(null, `t.me/${owner}`)
      ._Group()
      .Text(`\n  ${description}\n\n`)
      .Bold(`Владелец: `)
      .Url(ownerName, `t.me/${owner}`),
  myOC: (name, description, owner) =>
    new Xitext()
      ._Group(name)
      .Bold()
      .Url(null, `t.me/${owner}`)
      ._Group()
      .Text(`\n  ${description}\n\n`)
      .Bold(`Это Ваш персонаж`),
};

import "./menu/Find/find.js";
import "./menu/Find/oc.js";
import "./menu/Find/uOC.js";

import "./menu/MainMenu/index.js";

import "./menu/MyOC/del.js";
import "./menu/MyOC/edit.js";
import "./menu/MyOC/my.js";
import "./menu/MyOC/myoc.js";

import "./menu/Reg/index.js";

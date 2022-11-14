import { triggerEvent } from "../../lib/Class/Events.js";
import { util } from "../../lib/Class/Utils.js";
import { log } from "../../lib/SERVISE.js";

const newUsers = {};

const newGroups = {};

/**
 *
 * @param {Context} ctx
 * @returns {DB.User}
 */
export function CreateUser(ctx) {
  const id = ctx.from.id;
  const name = util.getName(ctx.from);
  const nickname = ctx.from.username;

  if (newUsers[id]) return newUsers[id];

  log(
    `Новый пользователь!\n Имя: ${name}\n ID: ${id}${
      nickname ? `\n @${nickname}` : ""
    }`
  );

  triggerEvent("new.member", ctx);

  const user = {
    static: {
      id: id,
      nickname: nickname,
      name: name,
    },
    cache: {},
  };

  newUsers[id] = user;
  return user;
}

/**
 *
 * @param {number} id
 * @param {string} title
 * @param {Array<number>} members
 * @returns {DB.Group}
 */
export function CreateGroup(id, title, members = []) {
  if (newGroups[id]) return newGroups[id];
  log(`Новая группа!\n Название: ${title}\n ID: ${id}`);
  const group = {
    static: {
      id: id,
      title: title,
    },
    cache: {
      members: members,
      lastCall: Date.now(),
      lastPin: {},
    },
  };
  newGroups[id] = group;
  return group;
}

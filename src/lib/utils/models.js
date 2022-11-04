import { log } from "../start-stop.js";

const newUsers = {},
  newGroups = {};

/**
 *
 * @param {number} id
 * @param {string} nickname
 * @param {string} name
 * @param {number} active
 * @returns {DB.User}
 */
export function CreateUser(id, nickname, name, active = Date.now()) {
  if (newUsers[id]) return newUsers[id];
  log(
    `Новый пользователь!\n Имя: ${name}\n ID: ${id}${
      nickname ? `\n @${nickname}` : ""
    }`
  );
  const user = {
    static: {
      id: id,
      nickname: nickname,
      name: name,
    },
    cache: {
      lastActive: active,
    },
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
  log(`Новая группа\n Название: ${title}\n ID: ${id}`);
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

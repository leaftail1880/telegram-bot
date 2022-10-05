import { log } from "./start-stop.js";

const newUsers = {}, newGroups = {};

/**
 * @typedef {Object} DBUser
 * @property {Object} static
 * @property {Number} static.id
 * @property {String} static.nickname
 * @property {String} static.name
 * @property {Object} cache
 * @property {String} cache.nickname
 * @property {String} cache.session
 * @property {String} cache.tag
 * @property {Number} cache.lastActive
 */

/**
 *
 * @param {Number} id
 * @param {String} nickname
 * @param {String} name
 * @param {String} customName
 * @param {String} tag
 * @param {Number} active
 * @param {Number} call
 * @param {Number} pin
 * @returns {DBUser}
 */
export function CreateUser(id, nickname, name, active = Date.now()) {
  if (newUsers[id]) return newUsers[id]
  log("Новый пользователь!\n ID: " + id + "\n Ник: " + nickname);
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
  newUsers[id] = user
  return user
}

/**
 * @typedef {Object} DBUgroup
 * @property {Object} static
 * @property {Number} static.id
 * @property {String} static.title
 * @property {Object} cache
 * @property {Array<Number>} cache.members
 * @property {Array<String>} cache.titleAnimation
 * @property {Number} cache.titleAnimationSpeed
 * @property {Number} cache.lastCall
 * @property {Object} cache.lastPin
 * @property {String} cache.pin
 */

/**
 *
 * @param {Number} id
 * @param {String} title
 * @param {Array<Number>} members
 * @param {*} call
 * @returns {DBUgroup}
 */
export function CreateGroup(id, title, members = [], call = Date.now()) {
  if (newGroups[id]) return newGroups[id]
  log("Новая группа!\n ID: " + id + "\n Название: " + title);
  const group = {
    static: {
      id: id,
      title: title,
    },
    cache: {
      members: members,
      lastCall: call,
      lastPin: {},
    },
  };
  newGroups[id] = group
  return group
}

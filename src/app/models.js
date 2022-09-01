/**
 * @typedef {Object} DBUser
 * @property {Object} static
 * @property {Number} static.id
 * @property {String} static.nickname
 * @property {String} static.name
 * @property {Object} cache
 * @property {String} cache.nickname
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
export function CreateUser(
  id,
  nickname,
  name,
  customName = null,
  tag = null,
  active = Date.now()
) {
  console.log("New user! Id: " + id + " Nickname: " + nickname);
  return {
    static: {
      id: id,
      nickname: nickname,
      name: name,
    },
    cache: {
      nickname: customName,
      tag: tag,
      lastActive: active,
    },
  };
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
 * @param {Array<String>} titleAnimation
 * @param {Number} titleAnimationSpeed
 * @param {*} call
 * @returns {DBUgroup}
 */
export function CreateGroup(
  id,
  title,
  members = [],
  titleAnimation = [],
  titleAnimationSpeed = 10,
  call = Date.now()
) {
  console.log("New group! Id: " + id + " Title: " + title);
  return {
    static: {
      id: id,
      title: title,
    },
    cache: {
      members: members,
      titleAnimation: titleAnimation,
      titleAnimationSpeed: titleAnimationSpeed,
      lastCall: call,
      pin: null,
      lastPin: {},
    },
  };
}

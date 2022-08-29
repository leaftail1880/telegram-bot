export let VERSION = [6, 2, 6];

export const dbkey = {
  session: 'bot_session'
}

/**
 * @typedef {Object} DBUser
 * @property {Number} id 
 * @property {String} nickname 
 * @property {String} name 
 * @property {String} customName 
 * @property {String} tag 
 * @property {Number} active 
 * @property {Number} call 
 * @property {Number} pin 
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
export function CreateUser(id, nickname, name, customName = null, tag = null, active = Date.now(), call = Date.now(), pin = Date.now()) {
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
      lastCall: call,
      lastPin: pin
    }
  }
}

export const dev = true;

export const MEMBERS = {
  // .
  dot: {
    msk: 2,
    start: ["00", "00"],
    end: ["05", "00"],
  },
  // Xiller
  xiller: {
    msk: 0,
    start: ["00", "00"],
    end: ["05", "00"],
    admin: true,
  },
  // Hloya
  hloya: {
    msk: 7,
    start: ["00", "00"],
    end: ["05", "00"],
  },
  default: {
    msk: 0,
    start: ["00", "00"],
    end: ["05", "00"],
  },
};

export const PORT = 35246;

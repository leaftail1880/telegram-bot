import { Context } from "telegraf";
import { CreateGroup, CreateUser } from "../models.js";
import { database } from "../../index.js";
import { d, format } from "../class/formatterCLS.js";

/**
 * @typedef {Object} getUser
 * @property {DB.User} user
 * @property {boolean} saveU
 */

/**
 * @typedef {Object} getGroup
 * @property {DB.Group} group
 * @property {boolean} saveG
 */

/**
 *
 * @param {Context} ctx
 * @param {boolean} save
 * @returns {Promise<getUser>}
 */
export async function getUser(ctx, save = false) {
  let user = await database.get(d.user(ctx.from.id), true),
    saveU = false;
  if (!user)
    (user = CreateUser(
      ctx.from.id,
      ctx.from.username,
      format.getName(ctx.from)
    )),
      (saveU = true);
  if (saveU && save) await database.set(d.user(ctx.from.id), user, true);
  return { user, saveU };
}
/**
 *
 * @param {Context} ctx
 * @param {boolean} save
 * @returns {Promise<getGroup>}
 */
export async function getGroup(ctx, save = true) {
  let group = await database.get(d.group(ctx.chat.id), true),
    saveG = false;
  if (!group && (ctx.chat.type == "group" || ctx.chat.type == "supergroup"))
    (group = CreateGroup(ctx.chat.id, ctx.chat.title)), (saveG = true);
  if (saveG && save) await database.set(d.group(ctx.chat.id), group, true);
  return { group, saveG };
}

/**
 *
 * @returns {Promise<Array<DB.Group>>}
 */
export async function getRegisteredGroups() {
  let groups = [];
  for (const key of (await database.keys()).filter((e) =>
    e.startsWith(`Group::`)
  )) {
    groups.push(await database.get(key, true));
  }
  return groups;
}

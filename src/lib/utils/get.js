import { Context } from "telegraf";
import { CreateGroup, CreateUser } from "./models.js";
import { database } from "../../index.js";
import { d, util } from "../Class/Utils.js";

/**
 *
 * @param {Context} ctx
 * @returns {Promise<DB.User>}
 */
export async function getUser(ctx) {
  let user = await database.get(d.user(ctx.from.id), true);

  if (!user) {
    user = CreateUser(ctx.from.id, ctx.from.username, util.getName(ctx.from));
    user.needSafe = true;
  }

  return user;
}
/**
 *
 * @param {Context} ctx
 * @returns {Promise<DB.Group | undefined>}
 */
export async function getGroup(ctx) {
  if (ctx.chat.type !== "supergroup" && ctx.chat.type !== "group") return;

  const group =
    (await database.get(d.group(ctx.chat.id), true)) ??
    CreateGroup(ctx.chat.id, ctx.chat.title);

  return group;
}

/**
 *
 * @returns {Promise<Array<DB.Group>>}
 */
export async function getRegisteredGroups() {
  const groups = [];

  const keys = await database.keys(`Group::*`);

  for (const key of keys) groups.push(await database.get(key, true));

  return groups;
}

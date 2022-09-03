import { Context } from "telegraf";
import { format } from "../../app/class/formatterCLS.js";
import { CreateGroup, CreateUser } from "../../app/models.js";
import { bot } from "../../app/setup/tg.js";
import { database } from "../../index.js";

/**
 * @typedef {Object} getUser
 * @property {import("../../app/models.js").DBUser} user
 * @property {Boolean} saveU
 */

/**
 * @typedef {Object} getGroup
 * @property {import("../../app/models.js").DBUgroup} group
 * @property {Boolean} saveG
 */

/**
 *
 * @param {Context} ctx
 * @param {Boolean} save
 * @returns {Promise<getUser>}
 */
export async function getUser(ctx, save = false) {
  let user = await database.get(`User::${ctx.from.id}`, true),
    saveU = false;
  if (!user)
    (user = CreateUser(
      ctx.from.id,
      ctx.from.username,
      `${ctx.from.first_name}${
        ctx.from.last_name ? " " + ctx.from.last_name : ""
      }`
    )),
      (saveU = true);
  if (saveU && save) await database.set(`User::${user.static.id}`, user, true);
  return { user, saveU };
}
/**
 *
 * @param {Context} ctx
 * @param {Boolean} save
 * @returns {Promise<getGroup>}
 */
export async function getGroup(ctx, save = true) {
  let group = await database.get(`Group::${ctx.chat.id}`, true),
    saveG = false;
  if (!group && (ctx.chat.type == "group" || ctx.chat.type == "supergroup"))
    (group = CreateGroup(ctx.chat.id, ctx.chat.title)), (saveG = true);
  if (saveG && save)
    await database.set(`Group::${group.static.id}`, user, true);
  return { group, saveG };
}

/**
 *
 * @returns {Promise<Array<import("../../app/models.js").DBUgroup>>}
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

bot.on("message", async (ctx, next) => {
  if (ctx.message.from.is_bot) return;
  const u = await getUser(ctx, false),
    user = u.user;
  if (ctx.chat.type == "group" || ctx.chat.type == "supergroup") {
    const g = await getGroup(ctx, false),
      group = g.group;
    if (!group.cache.members.includes(user.static.id))
      (group.cache.members = format.add(group.cache.members, user.static.id)),
        (g.saveG = true);
    if (g.saveG) database.set(`Group::${group.static.id}`, group, true);
  }
  user.cache.lastActive = Date.now();
  database.set(`User::${user.static.id}`, user, true);
  next();
});

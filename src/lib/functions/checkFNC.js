import { Context } from "telegraf";
/**
 *
 * @param {Context} ctx
 * @param {number} id
 */
export async function isAdmin(ctx, id, user = null) {
  const t = user ?? (await ctx.getChatMember(id));
  if (t.status == "administrator" || t.status == "creator") return true;
  return false;
}

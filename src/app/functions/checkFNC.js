import { Context,  } from "telegraf";
/**
 * 
 * @param {Context} ctx 
 * @param {Number} id 
 */
export async function isAdmin(ctx, id) {
  const t = await ctx.getChatMember(id)
  if (t.status == 'administrator' || t.status == 'creator') return true
  return false
}
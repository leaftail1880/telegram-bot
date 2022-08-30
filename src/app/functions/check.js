import { Context } from "telegraf";
import { members } from "../setup/tg.js";
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
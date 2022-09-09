import { bot } from "../setup/tg.js";

const EVENTS = {


}

export class onMessage {
  constructor(type = 'text', lvl = 0, callback) {
    if (!Array.isArray(EVENTS[type])) EVENTS[type] = []
    EVENTS[type].push({ callback: callback, lvl: lvl })
    EVENTS[type] = EVENTS[type].sort((a, b) => a.lvl - b.lvl)
  }
}

function execute(funcs, ctx, data) {
  if (!Array.isArray(funcs)) return
  const f = funcs
    .map(e => e?.callback)
    .filter((e) => typeof e === 'function')
  if (!f[0]) return
  f(ctx, (...data) => {
    execute(f.slice(1), ctx, data)
  })
}

export async function loadEvents() {
  bot.on('message', async (ctx) => {
    const evs1 = EVENTS['message'] ?? []
    if (ctx.message)
    execute(evs1, ctx)
  })
}
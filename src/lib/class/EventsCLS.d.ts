export class EventListener {
  constructor(type: Event.Type, lvl: number, callback: Event.Callback): EventListener
}

export function emitEvents(type: Event.Type): void
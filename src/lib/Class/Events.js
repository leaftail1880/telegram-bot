/**
 * @type {Record<string, Array<IEvent.Stored>>}
 */
const EVENTS = {};

/** @type {IEvent.Creator} */
export function on(type, position, callback) {
	const TypedEvents = (EVENTS[type] ??= []);
	const InternalEvent = {
		position,
		callback,
	};
	TypedEvents.push(InternalEvent);
	EVENTS[type] = TypedEvents.sort((a, b) => b.position - a.position);
}

/** @type {IEvent.Trigger} */
export async function emit(type, context) {
	if (EVENTS[type])
		for (const { callback } of EVENTS[type]) {
			await callback({}, () => void 0, context);
		}
}

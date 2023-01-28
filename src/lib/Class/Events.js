/** @type {Record<string, Function[]>}*/
const EVENTS = {};

/**
 * Subscribes to event
 * @param {keyof typeof IEvent.Events} type
 * @param {Function} callback
 */
export function on(type, callback) {
	const TypedEvents = (EVENTS[type] ??= []);
	TypedEvents.push(callback);
}

/**
 * Triggers event listeners
 * @param {keyof typeof IEvent.Events} type
 */
export async function emit(type) {
	if (EVENTS[type])
		for (const callback of EVENTS[type]) {
			await callback();
		}
}

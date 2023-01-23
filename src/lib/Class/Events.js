/** @type {Record<string, Function[]>}*/
const Events = {};

/**
 * Subscribes to event
 * @param {keyof typeof IEvent.Events} type
 * @param {Function} callback
 */
export function on(type, callback) {
	const TypedEvents = (Events[type] ??= []);
	TypedEvents.push(callback);
}

/**
 * Triggers event listeners
 * @param {keyof typeof IEvent.Events} type
 */
export async function emit(type) {
	if (Events[type])
		for (const callback of Events[type]) {
			await callback();
		}
}

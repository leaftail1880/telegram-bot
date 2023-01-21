/**
 * Checks if Context has message.text
 * @template {Context} ctx
 * @param {ctx} ctx
 * @returns {ctx is Context & { message: import("telegraf/types").Message.TextMessage; data: IEvent.Data}}
 */
export function hasText(ctx) {
	return "message" in ctx && "text" in ctx.message;
}

/**
 * Checks if Context has message.document
 * @template {Context} ctx
 * @param {ctx} ctx
 * @returns {ctx is Context & { message: import("telegraf/types").Message.DocumentMessage; data: IEvent.Data}}
 */
export function hasDocument(ctx) {
	return "message" in ctx && "document" in ctx.message;
}

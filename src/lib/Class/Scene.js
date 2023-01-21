import { bot, tables } from "../../index.js";
import { Command } from "./Command.js";
import { on } from "./Events.js";
import { d } from "./Utils.js";

/**
 * @template {Record<string, any>} SceneData
 * @template {(ctx: any, next: any) => any} [MiddlewareFn = ((ctx: DataContext & {scene: {leave(): any; next(): any; data: SceneData}}, next: () => Promise<void>) => any)]
 */
export class Scene {
	/** @type {Record<string, Scene>} */
	static scenes = {};
	nextHandlers = {};
	isWizardScene = false;
	/**
	 *
	 * @param {string} name
	 * @param {...(MiddlewareFn | {middleware: MiddlewareFn; next: MiddlewareFn})} [handlers]
	 */
	constructor(name, ...handlers) {
		this.name = name;
		Scene.scenes[name] = this;

		if (handlers.length > 1) {
			this.isWizardScene = true;
			const mappedHandlers = handlers.map((fn) => (typeof fn === "function" ? { middleware: fn } : fn));

			const T = this;

			/**
			 * @param {DataContext & {scene?: {leave(): any; next(): any; data: any}}} ctx
			 */
			function MakeScene(ctx, i = 0) {
				ctx.scene = {
					next() {
						if (i + 1 in mappedHandlers) return T.enter(ctx.from.id, (i + 1).toString());
						throw new Error("No next function specified");
					},
					leave() {
						return T.exit(ctx.from.id);
					},
					data: new Proxy(ctx.data.user.cache.sceneCache, {
						set(t, p, r) {
							const status = Reflect.set(t, p, r);
							tables.users.set(ctx.from.id, ctx.data.user);
							return status;
						},
						deleteProperty(t, p) {
							const status = Reflect.deleteProperty(t, p);
							tables.users.set(ctx.from.id, ctx.data.user);
							return status;
						},
					}),
				};
			}

			on("modules.load", 0, () => {
				for (let [i, fn] of mappedHandlers.entries()) {
					const sceneName = i.toString();
					if ("next" in fn) this.nextHandlers[sceneName] = fn.next;

					bot.use((ctx, next) => {
						if (this.state(ctx.data) !== sceneName) return next();
						MakeScene(ctx, i);
						fn.middleware(ctx, next);
					});
				}
			});
		}
	}
	/**
	 * Entering an user to specified scene
	 * @param {string | number} id
	 * @param {string} [scene]
	 * @param {any} [cache]
	 * @param {boolean} [newCache]
	 * @returns {Promise<void>}
	 */
	enter(id, scene = "0", cache, newCache = false) {
		const user = tables.users.get(id);

		if (!user || typeof user !== "object") return;
		user.cache.scene = d.pn(this.name, scene);

		if (cache) newCache ? (user.cache.sceneCache = cache) : user.cache.sceneCache.push(cache);
		tables.users.set(id, user);
	}
	/**
	 * Deletes all cache and scene info from user with specified id
	 * @param {string | number} id Id of user
	 * @returns {Promise<void>}
	 */
	exit(id) {
		const user = tables.users.get(id);
		if (!user || typeof user != "object") return;
		delete user.cache.scene;
		delete user.cache.sceneCache;
		tables.users.set(id, user);
	}
	/**
	 * Gets current scene state
	 * @param {State} data
	 * @returns {string | false}
	 */
	state(data) {
		if (!("scene" in data) || data.scene.name !== this.name || "group" in data) return false;

		return data.scene.state;
	}
	/**
	 * Register the handler for entering specified scene scene
	 * @param {string} scene
	 * @param {(ctx: TextMessageContext, data: DB.User) => void} callback
	 */
	next(scene, callback) {
		if (this.isWizardScene)
			throw new Error("To set next listener on Wizard scene use { middleware() {}, next() {} } in constructor!");

		this.nextHandlers[scene] = callback;
	}
}

new Command(
	{
		name: "cancel",
		description: "Выход из пошагового меню",
		hideFromHelpList: true,
		allowScene: true,
		permission: "all",
		target: "private",
	},
	async (ctx, _args, data) => {
		const user = data.user;
		if (user?.cache?.scene || user?.cache?.sceneCache) {
			await ctx.reply(`Вы вышли из меню ${user.cache.scene.replace("::", " ")}`);
			delete user.cache.scene;
			delete user.cache.sceneCache;
			tables.users.set(ctx.from.id, user);
		} else ctx.reply("Вы не находитесь в меню!");
	}
);

new Command(
	{
		name: "next",
		description: "Переходит на следующий шаг меню",
		hideFromHelpList: true,
		allowScene: true,
		permission: "all",
		target: "private",
	},
	async (ctx, _a, data) => {
		const no_menu = () => ctx.reply("Вы не находитесь в меню!");
		const no_skip = () => ctx.reply("Этот шаг не предусматривает пропуска!");

		if (!data.scene) return no_menu();

		const scene = Scene.scenes[data.scene.name];
		if (!scene) return no_menu();

		if (typeof scene.nextHandlers[data.scene.state] !== "function") return no_skip();

		scene.nextHandlers[data.scene.state](ctx, data.user);
	}
);

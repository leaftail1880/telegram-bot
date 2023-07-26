import { bot, tables } from "../../index.js";
import { Command } from "./Command.js";
import { u } from "./Utils.js";

/**
 * @param {DataContext & {scene?: {leave(): any; next(): any; data: any}}} ctx
 * @param {Scene} scene
 */
function MakeScene(ctx, scene, i = 0) {
	ctx.scene = {
		next() {
			const step = i + 1;
			if (!(step in scene.mappedHandlers))
				throw new Error("No next function specified");

			return scene.enter(ctx.from.id, step.toString());
		},
		leave() {
			return scene.exit(ctx.from.id);
		},
		data: new Proxy((ctx.data.user.cache.sceneCache ??= {}), {
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
	return ctx;
}

/**
 * @template {Record<string, any>} SceneData
 * @typedef {(
 *   ctx: DataContext & {scene: {leave(): void; next(): void; data: SceneData}},
 *   next: () => Promise<void>
 * ) => any} MiddlewareFunction
 */

/**
 * @template {Record<string, any>} [SceneData = Record<string, any>]
 * @template {(ctx: any, next?: any) => any} [MiddlewareFn = MiddlewareFunction<SceneData>]
 */
export class Scene {
	/** @type {Record<string, Scene>} */
	static scenes = {};
	/** @type {Record<string, MiddlewareFn>} */
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

		if (handlers.length > 0) {
			this.isWizardScene = true;
			const mappedHandlers = handlers.map((fn) =>
				typeof fn === "function" ? { middleware: fn } : fn
			);
			this.mappedHandlers = mappedHandlers;

			process.on("modulesLoad", () => {
				/**
				 * @type {Record<string, {
				 *   middleware: MiddlewareFn;
				 *   next?: MiddlewareFn;
				 * }>}
				 */
				const scenes = {};

				for (let [i, fn] of mappedHandlers.entries()) {
					const sceneName = i.toString();
					if ("next" in fn) this.nextHandlers[sceneName] = fn.next;
					scenes[sceneName] = fn;
				}

				bot.use((ctx, next) => {
					const step = this.step(ctx.data);
					if (step === false || !(step in scenes)) return next();

					const fn = scenes[step];
					MakeScene(ctx, this, parseInt(step));
					fn.middleware(ctx, next);
				});
			});
		}
	}
	/**
	 * Entering an user to specified scene
	 * @param {string | number | DB.User} user
	 * @param {string} [scene]
	 * @param {Optional<SceneData>} [cache]
	 * @returns {Promise<void>}
	 */
	enter(user, scene = "0", cache) {
		if (typeof user === "number") user = tables.users.get(user);
		if (!user || typeof user !== "object") return;

		user.cache.scene = u.pn(this.name, scene);
		if (cache) user.cache.sceneCache = cache;

		tables.users.set(user.static.id, user);
	}
	/**
	 * Deletes all cache and scene info from user with specified id
	 * @param {string | number} id Id of user
	 * @returns {Promise<void>}
	 */
	exit(id) {
		const user = tables.users.get(id);
		if (!user || typeof user !== "object") return;

		delete user.cache.scene;
		delete user.cache.sceneCache;
		tables.users.set(id, user);
	}
	/**
	 * Gets current scene state
	 * @param {State} data
	 * @returns {string | false}
	 */
	step(data) {
		if (!data?.scene || data.scene.name !== this.name || "group" in data)
			return false;

		return data.scene.state;
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

		if (!("scene" in data)) return no_menu();

		const scene = Scene.scenes[data.scene.name];
		if (!scene) return no_menu();

		if (typeof scene.nextHandlers[data.scene.state] !== "function") return no_skip();

		MakeScene(ctx, scene, parseInt(data.scene.state));
		// 9.1.16
		// @ts-expect-error Idk how to make extensionable context type safe
		scene.nextHandlers[data.scene.state](ctx, data.user);
	}
);

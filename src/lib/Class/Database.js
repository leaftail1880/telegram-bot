import { SingleBar } from "cli-progress";
import { createClient } from "redis";
import { clearLines, handlers } from "../Service.js";
import styles from "../styles.js";

/**
 * @typedef {string|number|boolean} StringLike
 */

export class RedisDatabase {
	#Client;
	#Closed = true;
	#Prefix = "";

	/**
	 * @type {Record<string, any>}
	 */
	#Cache = {};

	_ = {
		t: this,
		/**
		 * Trying to connect db and shows progress to console
		 */
		async connect() {
			const b1 = new SingleBar({
				format: `[${styles.progressBar("{bar}")}] {percentage}% - {value}/{total} connecting`,
				barCompleteChar: "#",
				barIncompleteChar: "..",
				hideCursor: true,
			});
			b1.start(150, 0);

			const int = setInterval(() => {
				if (b1.getProgress() <= b1.getTotal()) b1.increment();
			}, 10);

			await this.t.#Client.connect();

			clearInterval(int);

			b1.stop();
			clearLines(-1);

			this.t.#Closed = false;
			await this.t.downloadDB();
		},
		/**
		 * Reconects to redis by client
		 * @throws Error if ping failed
		 */
		async reconnect() {
			if (this.t.#Closed) {
				await this.t.#Client.ping();
				this.t.#Closed = false;
			}
		},
		/**
		 * Closes client and quits
		 * @param {boolean} quit Enable this if you have internet connection on closing
		 */
		async close(quit = true) {
			if (quit) await this.t.client.quit();
			this.t.#Closed = true;
		},
		/**
		 *
		 * @param {any} client
		 * @param {string} prefix
		 */
		makeChild(client, prefix) {
			this.t.#Client = client;
			this.t.#Prefix = prefix;

			return this.t;
		},
		/**
		 *
		 * @param {string} prefix
		 */
		createTable(prefix) {
			return new RedisDatabase()._.makeChild(this.t.#Client, prefix);
		},
	};

	/**
	 * Creates a new RedisDatabase istance
	 * @param {string} url
	 */
	constructor(url = null) {
		this.#Client = createClient({ url });
		this.#Client.on("error", handlers.dbError);
	}

	/**
	 *
	 * @param {StringLike} key
	 * @private
	 */
	key(key) {
		return `${this.#Prefix}::${key}`;
	}

	get isClosed() {
		return this.#Closed || !this.#Client.isOpen;
	}

	/**
	 * If the client is closed, throw an error. If the client is not open, throw an error. If the client
	 * is open, return the client
	 * @returns The client object.
	 * @throws
	 */
	get client() {
		if (this.#Closed) throw new Error("Custom Redis Client closed");
		if (!this.#Client?.isOpen) throw new Error("Custom Redis Client not opened");
		return this.#Client;
	}

	/**
	 * Запрашивает данные с датабазы
	 * @param {StringLike} key
	 * @returns {Promise<unknown> }
	 */
	async getActualData(key, jsonparse = false) {
		const value = await this.client.get(this.key(key));
		let result = value;

		if (jsonparse)
			try {
				result = JSON.parse(value);
			} catch {}

		this.#Cache[key + ""] = result;

		return result;
	}
	/**
	 * Забирает данные с кэша
	 * @param {StringLike} key
	 * @returns {Promise<string | boolean | number | any>}
	 */
	async get(key, jsonparse = false) {
		key = key + "";
		const value = this.#Cache[key] ?? (await this.client.get(this.key(key)));
		let result = value;

		if (jsonparse)
			try {
				result = JSON.parse(value);
			} catch {}

		this.#Cache[key] = result;

		return result;
	}
	/**
	 *
	 * @param {StringLike} key
	 * @param {boolean} jsonparse
	 * @returns
	 */
	async getWork(key, jsonparse = false) {
		key = this.key(key);
		const data = await this.get(key, jsonparse);
		const T = this;

		return {
			data,
			save: () => T.set(key, data),
		};
	}
	/**
	 * Запрашивает данные с датабазы
	 * @param {StringLike} key
	 * @returns {Promise<boolean>}
	 */
	async delete(key) {
		const value = await this.client.del(this.key(key));
		Reflect.deleteProperty(this.#Cache, key + "");

		return !!value;
	}
	/**
	 * Устанавливает данные в базу данных
	 * @param {StringLike} key
	 * @param {string | boolean | Object} value
	 * @returns
	 */
	async set(key, value) {
		this.#Cache[key + ""] = value;
		if (typeof value !== "string") value = JSON.stringify(value);

		await this.client.set(this.key(key), value);
	}
	/**
	 * @param {StringLike} key
	 * @returns {Promise<boolean>}
	 */
	async has(key) {
		return !!(await this.client.exists(this.key(key)));
	}
	/**
	 * It increases the value of a key by a number
	 * @param {StringLike} key - The key to increase.
	 * @param {number} number - The number to increase the key by.
	 * @returns The result of the increment operation.
	 */
	async increase(key, number = 1) {
		const result = await this.client.incrBy(this.key(key), number);
		this.#Cache[key + ""] = result;

		return result;
	}
	/**
	 * It decreases the value of a key by a number
	 * @param {StringLike} key - The key to decrease.
	 * @param {number} number - The number to decrease the key by.
	 * @returns The result of the decrement operation.
	 */
	async decrease(key, number = 1) {
		const result = await this.client.decrBy(this.key(key), number);
		this.#Cache[key + ""] = result;

		return result;
	}
	/**
	 * This function returns an array of all the keys in the database that match the filter
	 * @param {string} filter - The filter to use when searching for keys.
	 * @returns An array of keys
	 */
	async keysAsync(filter = "*") {
		const keys = await this.client.keys(filter);

		return keys;
	}
	/**
	 * It returns an array of all the keys in the cache
	 * @returns The keys of the cache object.
	 */
	keys() {
		return Object.keys(this.#Cache);
	}
	/**
	 * It returns a collection of all the keys and values in the database
	 * @returns {Promise<Record<string, any>>} An object with the key being the key and the value being the value.
	 */
	async downloadDB() {
		const collection = {};
		const keys = await this.keysAsync();

		const b1 = new SingleBar({
			format: `[${styles.progressBar("{bar}")}] {percentage}% - {value}/{total} keys`,
			barCompleteChar: "#",
			barIncompleteChar: "..",
			hideCursor: true,
		});

		b1.start(keys.length, 0);

		for (const key of keys) {
			collection[key] = await this.client.get(key);

			b1.increment();
		}
		b1.stop();
		clearLines(-1);

		this.#Cache = collection;
		return collection;
	}
	/**
	 * It returns a collection of all the keys and values in the cache
	 * @returns
	 */
	collection() {
		return this.#Cache;
	}
}

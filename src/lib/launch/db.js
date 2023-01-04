/**
 * @template Func, [This = any]
 * @param {Func} func
 * @param {This} context
 * @returns {Func}
 */
function BIND(func, context) {
	if (typeof func !== "function") return func;
	return func.bind(context);
}

/**
 * @typedef {import("redis").RedisClientType} cli
 */

export class RedisDatabase {
	/**
	 * @type {cli | 'closed'}
	 */
	#CLIENT = "closed";
	/**
	 * @type {cli | 'closed'}
	 */
	#CLOSED_CLIENT = "closed";

	/**
	 * @type {Record<string, any>}
	 */
	#CACHE = {};

	_ = {
		close: BIND(this.#close, this),
		connect: BIND(this.#connect, this),
	};

	async #close(quit = true) {
		if (quit) await this.client.quit();
		[this.#CLOSED_CLIENT, this.#CLIENT] = [this.#CLIENT, this.#CLOSED_CLIENT];
	}
	/**
	 *
	 * @param {*} c
	 */
	async #connect(c) {
		if (c) {
			await c.connect();
			this.#CLIENT = c;
			this.#CLOSED_CLIENT = "closed";
			await this.collectionAsync();
		} else if (this.#CLOSED_CLIENT !== "closed") {
			[this.#CLOSED_CLIENT, this.#CLIENT] = [this.#CLIENT, this.#CLOSED_CLIENT];
		}
	}

	get isClosed() {
		return this.#CLIENT === "closed" || !this.#CLIENT.isOpen;
	}

	/**
	 * If the client is closed, throw an error. If the client is not open, throw an error. If the client
	 * is open, return the client
	 * @returns The client object.
	 * @throws
	 */
	get client() {
		if (this.#CLIENT === "closed") throw new Error("Custom Redis Client closed");
		if (!this.#CLIENT.isOpen) throw new Error("Custom Redis Client not opened");
		return this.#CLIENT;
	}

	/**
	 * Запрашивает данные с датабазы
	 * @param {string} key
	 * @returns {Promise<string | boolean | number | any>}
	 */
	async getActualData(key, jsonparse = false) {
		const value = await this.client.get(key);
		let result = value;

		if (jsonparse)
			try {
				result = JSON.parse(value);
			} catch {}

		this.#CACHE[key] = result;

		return result;
	}
	/**
	 * Забирает данные с кэша
	 * @param {string} key
	 * @returns {Promise<string | boolean | number | any>}
	 */
	async get(key, jsonparse = false) {
		const value = this.#CACHE[key] ?? (await this.client.get(key));
		let result = value;

		if (jsonparse)
			try {
				result = JSON.parse(value);
			} catch {}

		this.#CACHE[key] = result;

		return result;
	}
	/**
	 * Запрашивает данные с датабазы
	 * @param {string} key
	 * @returns {Promise<boolean>}
	 */
	async delete(key) {
		const value = await this.client.del(key);
		Reflect.deleteProperty(this.#CACHE, key);

		return !!value;
	}
	/**
	 * Устанавливает данные в базу данных
	 * @param {string} key
	 * @param {string | boolean | Object} value
	 * @returns
	 */
	async set(key, value) {
		this.#CACHE[key] = value;
		if (typeof value !== "string") value = JSON.stringify(value);

		await this.client.set(key, value);
	}
	/**
	 * @param {string} key
	 * @returns {Promise<boolean>}
	 */
	async has(key) {
		return !!(await this.client.exists(key));
	}
	/**
	 * It increases the value of a key by a number
	 * @param {string} key - The key to increase.
	 * @param {number} number - The number to increase the key by.
	 * @returns The result of the increment operation.
	 */
	async increase(key, number = 1) {
		const result = await this.client.incrBy(key, number);
		this.#CACHE[key] = result;

		return result;
	}
	/**
	 * It decreases the value of a key by a number
	 * @param {string} key - The key to decrease.
	 * @param {number} number - The number to decrease the key by.
	 * @returns The result of the decrement operation.
	 */
	async decrease(key, number = 1) {
		const result = await this.client.decrBy(key, number);
		this.#CACHE[key] = result;

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
		return Object.keys(this.#CACHE);
	}
	/**
	 * It returns a collection of all the keys and values in the database
	 * @returns {Promise<Record<string, any>>} An object with the key being the key and the value being the value.
	 */
	async collectionAsync() {
		const collection = {};
		const keys = (await this.keysAsync()).sort();

		for (const key of keys) {
			collection[key] = await this.client.get(key);
		}

		this.#CACHE = collection;
		return collection;
	}
	/**
	 * It returns a collection of all the keys and values in the cache
	 * @returns
	 */
	collection() {
		return this.#CACHE;
	}
}

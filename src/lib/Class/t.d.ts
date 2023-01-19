class AbstractDatabase<K extends string | number | symbol, V extends unknown> {
	get(key: K): Promise<V>;
	set(key: K, value: V): Promise;
	del(key: K): Promise;
	keys(...filters: any): Promise<K[]>;
	exists?: (key: K) => Promise<number | boolean>;
	has?: (key: K) => Promise<number | boolean>;
	isOpen: boolean;
	ping(): Promise;
	connect(): Promise;
	quit(): Promise;
}

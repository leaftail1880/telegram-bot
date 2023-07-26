/// <reference types="../../../types/lib.d.ts" />
/// <reference types="vite-plugin-api/client" />

declare const tables: typeof import("../../../lib/launch/db.js").tables;
declare const util: typeof import("../../../lib/Class/Utils.js").util;
declare const SubDB: typeof import("../../../modules/Subscribe/db.js").SubDB;
declare type Route<Body extends Record<string, any> | undefined = undefined> = (
	req: typeof import("express").request & { body: Body },
	res: typeof import("express").response,
	next: () => void
) => any;

interface ImportMeta {
	env: {
		PROD: boolean;
	};
}

declare module "autossh" {
	import { EventEmitter } from "events";

	export default function (conf: Config): AutoSSHexport;

	interface Config {
		host: string;
		/**
		 * @default "localhost"
		 */
		localHost?: string;
		/**
		 * @default localHost !== "localhost"
		 */
		reverse?: boolean;
		/**
		 * @default "root"
		 */
		username: string;
		remotePort: number | string;
		localPort: number | "auto";
		/**
		 * @default 30
		 */
		maxPollCount?: number;
		/**
		 * @default 70
		 */
		pollTimeout?: number;
		/**
		 * @default 120
		 */
		serverAliveInterval?: number;
		/**
		 * @default 1
		 */
		serverAliveCountMax?: number;
		/**
		 * @default 22
		 */
		sshPort?: number;
		/**
		 * @default null
		 */
		privateKey?: string;
	}

	interface ConnectionInfo {
		kill: () => () => void;
		pid: number | null;
		host: string | null;
		localHost: string | null;
		username: string | null;
		remotePort: number | null;
		localPort: number | null;
		execString: string | null;
	}

	interface AutoSSHexport {
		on(name: "error", listener: (error: Error) => any): AutoSSHexport;
		on(
			name: "connect",
			listener: (connection: ConnectionInfo) => any
		): AutoSSHexport;
		on(
			name: "timeout",
			listener: (connection: ConnectionInfo) => any
		): AutoSSHexport;
		on(name: string, listener: () => any): AutoSSHexport;
		kill(): AutoSSHexport;
		get info(): ConnectionInfo;
		get pid(): number | null;
	}

	class AutoSSH extends EventEmitter {
		constructor(conf: Config);
		getConnectionInfo(): ConnectionInfo;
	}
}

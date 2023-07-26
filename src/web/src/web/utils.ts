import * as fusorjs from "@fusorjs/dom/html";
Object.assign(window, fusorjs);

window.api = async function (
	path,
	{ method = "GET", body = void 0, headers = {}, token = false } = {}
) {
	let newbody;
	if (token) {
		body ??= {};
		body.token = TelegramToken;
	}
	if (body) {
		newbody = JSON.stringify(body);
		if (method === "GET" || method === "HEAD") method = "POST";
		headers["Content-Type"] = "application/json";
	}
	const connection = await fetch("/api/" + path, {
		method,
		body: newbody,
		headers,
	});

	if (!connection.ok) {
		throw new Error(connection.statusText);
	} else return connection.json();
} as typeof api;

export class EventEmitter<
	Arg = any,
	Callback extends Function = (arg?: Arg) => void
> {
	private events = new Set<Callback>();

	onload(callback: Callback) {
		this.events.add(callback);
	}
	emit(arg?: Arg) {
		[...this.events.values()].forEach((e) => e(arg));
	}
}

export function EventLoader() {
	return {
		loaded: false,
		events: [] as Function[],
		onload(callback: Function) {
			if (!this.loaded) this.events.push(callback);
			else callback();
		},
		emit() {
			this.loaded = true;
			this.events.forEach((e) => e());
		},
	};
}

let TelegramToken = "";

export const AuthToken = EventLoader();

(async function fetchAuthToken() {
	const response = await api<{ valid: boolean; token: string }>("auth", {
		body: {
			hash: Telegram.WebApp.initData,
			user: Telegram.WebApp?.initDataUnsafe?.user?.username,
		},
		method: "POST",
	});

	if (response.valid) TelegramToken = response.token;

	AuthToken.emit();

	document.body.append(
		section(
			p(
				{ class: response.valid ? "hint" : "hint err" },
				response.valid ? "Valid token." : "Invalid token."
			)
		)
	);
})();

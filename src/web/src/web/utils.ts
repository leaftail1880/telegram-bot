import * as fusorjs from "@fusorjs/dom/html";
Object.assign(window, fusorjs);

class FetchError extends Error {}

window.api = async function (
	path,
	{ method = "GET", body = void 0, headers = {}, token = false } = {}
) {
	let newbody;
	if (token) {
		headers["Authorization"] = Authentication.token;
	}
	if (body) {
		newbody = JSON.stringify(body);
		if (method === "GET" || method === "HEAD") method = "POST";
		headers["Content-Type"] = "application/json";
	}
	const request = await fetch("/api/" + path, {
		method,
		body: newbody,
		headers,
	});

	if (!request.ok) {
		throw new FetchError(request.statusText);
	} else return request.json();
} as typeof api;

export class EventEmitter<Arg = any, Callback extends Function = (arg?: Arg) => void> {
	private events = new Set<Callback>();

	on(callback: Callback) {
		this.events.add(callback);
	}
	emit(arg?: Arg) {
		[...this.events.values()].forEach((e) => e(arg));
	}
}

type EventLoaderContext = {
	loaded: boolean;
	events: Function[];
	onload(callback: Function): void;
	emit(): void;
	reload(): void;
};

export function EventLoader<T extends Record<string, any>>(
	options: {
		process?: (this: EventLoaderContext & T) => void;
		context?: T;
	} = {}
) {
	const result = {
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
		reload() {
			if (options.process)
				options.process.call(result as EventLoaderContext & T);
		},
	};
	if (options.context) Object.assign(result, options.context);
	if (options.process) options.process.call(result as EventLoaderContext & T);
	return result as EventLoaderContext & T;
}

export const Authentication = EventLoader({
	context: { token: "" },
	async process() {
		const response = await api<{ valid: boolean; token: string }>("auth", {
			body: {
				hash: Telegram.WebApp.initData,
				user: Telegram.WebApp?.initDataUnsafe?.user?.username,
			},
			method: "POST",
		});

		if (response.valid) this.token = response.token;
		this.emit();

		document.body.append(
			section(
				p(
					{ class: response.valid ? "hint" : "hint err" },
					response.valid ? "Valid token." : "Invalid token."
				)
			)
		);
	},
});

type Status = "save" | "saving" | "done" | "error";
export function SaveButton(options: {
	status: Status;
	save: () => Promise<any>;
	statuses?: Partial<Record<Status, string>>;
}) {
	options.statuses ??= {};
	Object.assign(options.statuses, {
		save: i18n`Save!`,
		saving: i18n`Saving...`,
		done: i18n`Saved!`,
		error: i18n`Error, retry again.`,
	});

	const wrapper = button(
		{ disabled: () => options.status === "done" },
		() =>
			options.status === "save"
				? span("(!) ", { class: "hint", style: "color: yellow" })
				: "",
		() => options.statuses![options.status],
		{
			async click$e() {
				options.status = "saving";
				wrapper.update();
				options
					.save()
					.then(() => {
						options.status = "done";
					})
					.catch((e) => {
						console.error(e);
						options.status = "error";
					})
					.finally(() => {
						wrapper.update();
					});
			},
		}
	);

	return {
		saveButton: wrapper.element,
		needSave() {
			options.status = "save";
			wrapper.update();
		},
	};
}

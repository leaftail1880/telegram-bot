import { Authentication, EventLoader } from "./utils";

type UploadData = {
	type: string;
	base64_data: string;
};

export const TextEditor = EventLoader();

let BlockEmbed = Quill.import("blots/block/embed");
class ImageBlot extends BlockEmbed {
	node: HTMLElement;
	constructor(node: HTMLElement, value: Record<string, any>) {
		console.log("ImageBlot created with value:", value);
		super(node);
		this.node = node;

		let uploadData: undefined | UploadData;
		if (value.image) {
			this.node.appendChild(img({ src: this.sanitize(value.image) }));
			uploadData = this.uploadData(value.image);
		} else if (value.video) {
			this.node.appendChild(
				video({
					src: this.sanitize(value.video),
					preload: "auto",
					controls: "controls",
				})
			);
			uploadData = this.uploadData(value.video);
		}

		if (uploadData) {
			const progressBar = div({ class: "file_progress_bar" });

			this.node.classList.add("loading");
			this.node.appendChild(div({ class: "file_progress" }));
			this.node.appendChild(progressBar);

			uploadFile(
				uploadData,
				(loaded, total) => {
					let persent = 0;
					if (total && loaded) {
						persent = (loaded * 100) / total;
						persent = Math.min(100, persent);
					}
					progressBar.style.width = persent + "%";
				},
				(data) => {
					console.log(data);
					if (data?.src) {
						if (uploadData!.type.startsWith("video/")) {
							this.add(data.src, "video", video);
						} else {
							this.add(data.src, "img", img);
						}
						this.node.classList.remove("loading");
					}
				}, //,
					(error) => {
						quillE.deleteText(
							this.offset(quillE.scroll),
							this.length(),
							Quill.sources.SILENT
						);
						return console.error(error);
					}
			);
		}
	}

	add(
		src: string,
		tagName: string,
		creator: () => HTMLImageElement | HTMLVideoElement
	) {
		let element = this.node.querySelector(tagName) as
			| HTMLImageElement
			| HTMLVideoElement;

		if (element!.src.startsWith("https://telegra.ph")) {
			element = creator();
			this.node.appendChild(element);
		}
		element!.setAttribute("src", "https://telegra.ph" + src);
	}

	uploadData(url: string) {
		const match = url.match(
			/^data:(image\/gif|image\/jpe?g|image\/png|video\/mp4);base64,(.*)$/
		);

		if (match) {
			return { type: match[1], base64_data: match[2] };
		}
	}

	sanitize(url: string) {
		return sanitize(url, ["http", "https", "data"]) ? url : "//:0";
	}

	/**
	 * From HTMLElement back to quill value
	 * @param domNode
	 * @returns
	 */
	static value(domNode: HTMLElement) {
		const value: Record<string, any> = {
			caption: "",
		};
		const image = domNode.querySelector("img");
		if (image) {
			value.image = image.src;
		}
		const video = domNode.querySelector("video");
		if (video) {
			value.video = video.src;
		}
		return value;
	}
}
ImageBlot.blotName = "image";
ImageBlot.tagName = "figure";
Quill.register(ImageBlot, true);

function uploadFile(
	file_data: UploadData,
	onProgress: (a: number, b: number) => any,
	onSuccess: (data: any) => any,
	onError: (error: any) => any
) {
	if (!file_data) return;
	var data = new FormData();
	data.append("file", uploadDataToBlob(file_data));
	var xhr = new XMLHttpRequest();
	xhr.upload.addEventListener("progress", function (event) {
		if (event.lengthComputable) {
			onProgress(event.loaded, event.total);
		}
	});
	xhr.addEventListener("load", (data) => {
		if (data.target && "response" in data.target) {
			try {
				const json = JSON.parse(data.target.response as string);
				if (Array.isArray(json)) json.forEach(onSuccess);
				else throw new Error("Got unexpected result: " + data.target.response);
			} catch (e) {
				onError(e);
				console.error(data.target.response);
			}
		}
	});
	xhr.addEventListener("error", () => {
		return onError("Network error");
	});

	xhr.open("POST", "/api/upload");
	xhr.setRequestHeader("authorization", Authentication.token);
	onProgress && onProgress(0, 1);
	xhr.send(data);
}

TextEditor.emit();

function sanitize(url: string, protocols: string[]) {
	const link = new URL(url);
	return protocols.includes(link.protocol.replace(/:$/, ""));
}

function uploadDataToBlob(file_data: UploadData) {
	var binary = atob(file_data.base64_data);
	var array = [];
	for (var i = 0; i < binary.length; i++) {
		array.push(binary.charCodeAt(i));
	}
	return new Blob([new Uint8Array(array)], { type: file_data.type });
}

export function localPhotoParse(file: Blob): Promise<Blob> {
	return new Promise((callback) => {
		console.log("updating photo:", file);
		if (file.type === "image/jpg" || file.type === "image/jpeg") {
			loadImage(
				file,
				(canvas: {
					type: string;
					toBlob(cb: (file: Blob) => void, idk: string): void;
					toDataURL(a: string): string;
				}) => {
					if (canvas.type === "error") {
						callback(file);
					} else {
						if (canvas.toBlob) {
							canvas.toBlob(callback, file.type);
						} else {
							callback(
								uploadDataToBlob({
									type: file.type,
									base64_data: canvas.toDataURL(file.type).split(",")[1],
								})
							);
						}
					}
				},
				{
					canvas: true,
					orientation: true,
				}
			);
		} else callback(file);
	});
}

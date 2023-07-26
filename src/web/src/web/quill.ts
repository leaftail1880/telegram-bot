import { EventLoader } from "./utils";

let quill: import("quill").Quill;
type UploadData = {
	type: string;
	base64_data: string;
};

export const TextEditor = EventLoader();

document.getElementById("quill")!.addEventListener("load", () => {
	let BlockEmbed = Quill.import("blots/block/embed");
	class ImageBlot extends BlockEmbed {
		constructor(domNode: HTMLElement, value: Record<string, any>) {
			console.log("image blot created with value:", value);
			super(domNode);
			this.domWrapper = div();

			let upload_data: undefined | UploadData;
			if (value.image) {
				let image = img({ src: this.sanitize(value.image) });
				this.domWrapper.appendChild(image);
				upload_data = this.uploadData(value.image);
			} else if (value.video) {
				let vid = video({
					src: this.sanitize(value.video),
					preload: "auto",
					controls: "controls",
				});
				this.domWrapper.appendChild(vid);
				upload_data = this.uploadData(value.video);
			}

			if (upload_data) {
				const domProgressBar = div({ class: "file_progress_bar" });

				this.domWrapper.classList.add("loading");
				this.domWrapper.appendChild(
					div({ class: "file_progress" }),
					this.domProgressBar
				);

				uploadFile(
					upload_data,
					(loaded, total) => {
						let persent = 0;
						if (total && loaded) {
							persent = (loaded * 100) / total;
							persent = Math.min(100, persent);
						}
						domProgressBar.style.width = persent + "%";
					},
					(data) => {
						if (data) {
							let src = this.sanitize(data.src);
							if (upload_data!.type.startsWith("video/")) {
								let video = this.domWrapper.querySelector("video");
								video.setAttribute("src", src);
							} else {
								let image = this.domWrapper.querySelector("img");
								image.setAttribute("src", src);
							}
							this.domWrapper.classList.remove("loading");
						}
					},
					(error) => {
						quill.deleteText(
							this.offset(quill.scroll),
							this.length(),
							Quill.sources.SILENT
						);
						return console.error(error);
					}
				);
			}
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
				onProgress && onProgress(event.loaded, event.total);
			}
		});
		xhr.addEventListener("load", (data) => {
			console.log(data);
			onSuccess(data);
		});
		xhr.addEventListener("error", () => {
			return onError && onError("Network error");
		});

		xhr.open("POST", "/api/upload");
		onProgress && onProgress(0, 1);
		xhr.send(data);
	}

	TextEditor.emit();
});

function sanitize(url: string, protocols: string[]) {
	const link = new URL(url);
	return protocols.includes(link.protocol);
}

function uploadDataToBlob(file_data: UploadData) {
	var binary = atob(file_data.base64_data);
	var array = [];
	for (var i = 0; i < binary.length; i++) {
		array.push(binary.charCodeAt(i));
	}
	return new Blob([new Uint8Array(array)], { type: file_data.type });
}

export function updatePhoto(file: Blob): Promise<Blob> {
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
					console.log(canvas);
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

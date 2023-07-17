import { div } from "@fusorjs/dom/html";

document.getElementById("quill").addEventListener("load", () => {
  new Quill("#quill-editor", {
    modules: {
      toolbar: [
        ["image", "link"],
        ["bold", "italic", "underline"],
      ],
    },
    placeholder: "Compose an epic...",
    theme: "bubble"
  });
});

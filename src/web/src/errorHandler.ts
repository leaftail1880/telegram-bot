function escapeHtml(unsafe: string) {
	return unsafe
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;")
		.replace(/\n/g, "<br>");
}

window.addEventListener("error", (event) => {
	const p = document.createElement("p");
	p.textContent = escapeHtml(event.error);
	p.style.color = "red";
	const to = document.getElementById("errors") ?? document.body;
	to.appendChild(p);
});

window.addEventListener("unhandledrejection", (event) => {
	const p = document.createElement("p");
	p.innerHTML = escapeHtml(event.reason.stack ?? event.reason);
	p.style.color = "red";
	const to = document.getElementById("errors") ?? document.body;
	to.appendChild(p);
});

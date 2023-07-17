import { p, section } from "@fusorjs/dom/html";

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
    if (method === "GET" || method === "HEAD") method = "POST"
    headers["Content-Type"] = "application/json";
  }
  return (
    await fetch("/api/" + path, {
      method,
      body: newbody,
      headers,
    })
  ).json();
} as typeof api;

let TelegramToken = "";

export async function fetchAuthToken() {
  const response = await api<{ valid: boolean; token: string }>("auth", {
    body: {
      hash: Telegram.WebApp.initData,
      user: Telegram.WebApp?.initDataUnsafe?.user?.username,
    },
    method: "POST",
  });

  if (response.valid) TelegramToken = response.token;

  document.body.append(
    section(
      p(
        { class: response.valid ? "hint" : "err" },
        response.valid ? "Valid token." : "Invalid token."
      )
    )
  );
}

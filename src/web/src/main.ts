import { section } from "@fusorjs/dom/html";
import { Home } from './views/home.ts';
import { Fetcher } from "./views/fetcher.ts"
import "./style.css";

document.body.style.visibility = '';
Telegram.WebApp.ready();
Telegram.WebApp.MainButton.setParams({
    text: 'CLOSE WEBVIEW',
    is_visible: true
}).onClick(Telegram.WebApp.close);


document.body.append(
  section(
    Home(),
    Fetcher()
  ).element
);

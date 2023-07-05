
/**
 * @typedef {ReturnType<page>} Page
 */

/**
 * @param {Page} pageTo
 */
function link(pageTo) {
  pageTo.open()
}
/**
 * @param {...HTMLElement} childrens
 */
function page(...childrens) {
  return {
    async open(rootElement = root) {
      rootElement.children = await this.render()
    },
    async render() {
      for (const child of childrens) {
        if (typeof child === "function") 
      }
    }
  }
}
let root;
function renderPage(rootElement, rootPage) {
  root = rootElement
  rootPage.open()
}

const {Button, Page, Link, i18n} = LeafyTelegram

const main = Page(
  Button(i18n`Персонажи`, Link(ocs)),
  Button(i18n`Подписки`, Link(subs))
);

const ocs = Page(
  async () => {
    
  }
);
const subs = page();

renderPage(document.body., main)

import {div, p} from "@fusorjs/dom/html";

document.body.append(
  div(
    p("Hello World!"),
  )
);

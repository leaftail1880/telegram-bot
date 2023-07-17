/// <reference types="vite/client" />
/// <reference types="vite-plugin-api/client" />

declare type i18nDB = import("leafy-i18n").i18nDB;

declare function i18n(t: TemplateStringsArray, ...args: any[]): string;
declare namespace i18n {
  let db: i18nDB;
  let locale: string;
  let codeLocale: string;
}

declare function api<R, B extends null | undefined | Record<string, any> = any>(
  path: string,
  options?: {
    method?: string;
    body?: B;
    headers?: Record<string, string>;
    token?: boolean;
  }
): Promise<R>;

declare const Telegram: import("@twa-dev/types").Telegram;


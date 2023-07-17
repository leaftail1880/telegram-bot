/// <reference types="../../../types/lib.d.ts" />
/// <reference types="vite-plugin-api/client" />

declare const tables: typeof import("../../../lib/launch/db.js").tables;
declate const util: typeof import("../../../lib/Class/utils.js").util
declare type Route<Body extends Record<string, any> | undefined = undefined> = (
  req: typeof import("express").request & { body: Body },
  res: typeof import("express").response,
  next: () => void
) => any;

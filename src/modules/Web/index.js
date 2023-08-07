process.on("loaded", () =>
  setTimeout(() => import("../../web/dist/server/app.js"), 10000)
);

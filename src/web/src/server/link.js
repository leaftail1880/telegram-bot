// We need to load env before db because it depends on it
// Also botApiLink are used to link api from bot

export async function botApiEnv() {
  (await import("dotenv")).config({ path: "../../.env" });
}

export async function botApiLink() {
  const { tables, database, setupDatabase } = await import(
    "../../../lib/launch/db.js"
  );
  
  const { util } = await import("../../../lib/Class/Utils.js")

  setupDatabase();
  await database.connect();
  Object.defineProperties(globalThis, {
    tables: {
      configurable: true,
      enumerable: true,
      value: tables,
    },
    database: {
      configurable: true,
      enumerable: true,
      value: database
    },
    util: {
      configurable: true,
      enumerable: true,
      value: util
    }
  })
  console.log("[api] Bot api linked successfully!");
}
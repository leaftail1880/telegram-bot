type R = (req: any, res: any, next: any): any
interface globalThis {
  readonly tables: typeof import("../../../index.js").tables
}
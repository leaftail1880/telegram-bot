/** @type {R} */
export function GET(res, req, next) {
  return tables.users.get(tables.users.keys()[0])
}
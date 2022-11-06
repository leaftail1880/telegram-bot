/**
 *
 * @param {Object} sourceObject
 * @param {Object} defaultObject
 * @param {boolean} [onlyInDef]
 * @returns {Object}
 */
export function setDefaults(sourceObject, defaultObject, onlyInDef = true) {
  const composed = {};

  for (const key in sourceObject) {
    if (!(key in defaultObject) && onlyInDef) continue;

    composed[key] = sourceObject[key];
  }

  for (const key in defaultObject) {
    if (key in composed) continue;
    composed[key] = defaultObject[key];
  }

  return composed;
}

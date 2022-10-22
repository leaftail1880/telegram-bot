export function pathIsObject(pathArray, object, allowArrays) {
  if (!allowArrays) {
    console.log(
      `return typeof object?.${pathArray.join(
        "?."
      )} === 'object' && !Array.isArray(object?.${pathArray.join("?.")})`
    );
    return new Function(
      "object",
      `return typeof object?.${pathArray.join(
        "?."
      )} === 'object' && !Array.isArray(object?.${pathArray.join("?.")})`
    )(object);
  } else {
    return new Function(
      "object",
      `return typeof object?.${pathArray.join("?.")} === 'object'`
    )(object);
  }
}
export function pathIsSettable(pathArray, object, allowArrays) {
  const call = pathArray
    .slice(0, -1)
    .every((key, i) =>
      pathIsObject(pathArray.slice(0, -(i + 1)), object, allowArrays)
    );
  if (pathArray.slice(0, -1).length) {
    return call;
  } else {
    return true;
  }
}
export function assignToPath(pathArray, object, value, allowArrays = false) {
  const mappedPathArray = pathArray.map(
    (value) => `[${typeof value === "number" ? value : `'${value}'`}]`
  );
  //   	console.log(mappedPathArray)
  //   console.log(pathIsSettable(mappedPathArray, object))
  if (pathIsSettable(mappedPathArray, object, allowArrays)) {
    console.log({
      pathIsSettable: `object${mappedPathArray.join(
        ""
      )} = value; return object`,
    });
    return new Function(
      "object",
      "value",
      `object${mappedPathArray.join("")} = value; return object`
    )(object, value);
  } else {
    let stop = false;
    pathArray.forEach((path, i) => {
      const newPathArray = mappedPathArray.slice(0, i + 1);
      // console.log(newPathArray);
      if (!stop && !pathIsObject(newPathArray, object, allowArrays)) {
        // console.log(`object${newPathArray.join('')} = {}; return object`);
        object = new Function(
          "object",
          `object${newPathArray.join("")} = {}; return object`
        )(object);
      } else if (!stop && pathIsSettable(newPathArray, object, allowArrays)) {
        return;
      } else {
        stop = true;
      }
      // console.log('obj', object);
    });
    if (!stop) {
      return assignToPath(pathArray, object, value, allowArrays);
    }
  }
}

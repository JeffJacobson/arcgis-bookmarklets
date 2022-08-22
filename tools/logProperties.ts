export function logProperties(o: unknown, name: string, ignore = /^_/) {
  console.group(name);
  try {
    if (typeof o in ["string", "number", "boolean"]) {
      console.log(name, o);
    } else if (Array.isArray(o)) {
      o.forEach((v, i) => {
        logProperties(v, i.toString(), ignore);
      });
    } else {
      const record = o as Record<string, unknown>;
      for (const propName in record) {
        if (ignore.test(propName)) {
          continue;
        }
        if (Object.prototype.hasOwnProperty.call(o, propName)) {
          const value = record[propName];
          logProperties(value, propName, ignore);
        }
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    console.groupEnd();
  }
}

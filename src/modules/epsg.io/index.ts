export type EnvelopeCoordinates = [
  xmin: number,
  ymin: number,
  xmax: number,
  ymax: number
];

/**
 * Creates a table of coordinates for a mapping.
 * @param coordsMap A mapping of names to corresponding coordinates.
 * @returns An HTML table.
 */
export function createTable(coordsMap: Map<string, EnvelopeCoordinates>) {
  console.group("create table");
  const table = document.createElement("table");
  console.log("coordsMap", coordsMap);
  for (const [key, coordinates] of coordsMap) {
    console.log(`current key is ${key}`, coordinates);
    if (!coordinates) {
      console.warn(`No coordinates for ${key}`);
      continue;
    }
    const row = table.insertRow();
    console.log("row", row);
    const th = document.createElement("th");
    th.textContent = key;
    row.append(th);
    console.log("row", row);
    const td = row.insertCell();
    const pre = document.createElement("pre");
    pre.textContent = JSON.stringify(coordinates);
    td.append(pre);
    console.log(row);
  }
  console.groupEnd();

  return table;
}

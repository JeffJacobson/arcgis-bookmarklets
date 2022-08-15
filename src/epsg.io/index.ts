export function createTable(coordsMap: Record<string, number[]>) {
    const frag = document.createDocumentFragment();
    const table = document.createElement("table");
    for (const key in coordsMap) {
        if (Object.prototype.hasOwnProperty.call(coordsMap, key)) {
            const coordinates = coordsMap[key];
            const row = table.insertRow();
            const th = document.createElement("th");
            th.textContent = key;
            row.append(th);
            const td = row.insertCell();
            td.textContent = coordinates.join(",");
            table.append(row);
        }
    }
    frag.appendChild(table);
}
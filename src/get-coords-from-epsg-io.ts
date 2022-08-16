/**
 * Extracts coordinate information from an epsg.io page.
 * @example Sample DOM elements that this code parses.
 * ```html
 * <div class="col3 minimap-pad">
 *     <div id="mini-map" class=" center-mobile">
 *         <a href="/3857/map">
 *             <img src="/static/img/epsg-target-small.png" id="crosshair" alt="">
 *             <img src="https://api.maptiler.com/maps/streets/static/auto/265x215@2x.png?key=qrAJy6x3Ck8n4XFFH4PS&amp;latlng=1&amp;fill=rgba(255,0,0,0.15)&amp;stroke=red&amp;width=2&amp;path=-85,-179.9|85,-179.9|85,0|85,179.9|-85,179.9|-85,0|-85,-179.9"
 *                 alt="SimpleMap" width="265" height="215">
 *         </a>
 *     </div>
 *     <p>
 *         <span class="caption">Center coordinates</span><br>
 *         <span>0.00</span> <span>-0.00</span> <br>
 *     </p>
 *     <p>
 *         <span class="caption">Projected bounds:</span><br>
 *         -20026376.39 -20048966.10<br>
 *         20026376.39 20048966.10<br>
 *     </p>
 *     <p>
 *         <span class="caption">WGS84 bounds:</span><br>
 *         -180.0 -85.06<br>
 *         180.0 85.06
 *     </p>
 *     <p></p>
 *     <a href="/?q=World">World between 85.06°S and 85.06°N.</a>
 * </div>
 * ```
 */

import { type EnvelopeCoordinates, createTable } from "./epsg.io/index.js";

/** Matches numbers */
const re = /-?\d+(?:\.\d+)/g;

function* getCoordsFromParagraphs(...paragraphs: HTMLParagraphElement[]) {
  for (const p of paragraphs) {
    const caption =
      p.querySelector(".caption")?.textContent?.replace(/:$/, "") || null;
    const coords = [...p.childNodes]
      .filter((n) => n instanceof Text || n instanceof HTMLSpanElement)
      .map((t) => {
        const matches = t.textContent?.matchAll(re);
        if (!matches) return null;
        const output = new Array<RegExpMatchArray>();
        for (const m of matches) {
          output.push(m);
        }
        return output.flat();
      })
      .filter((match) => !!match)
      .map((match) => match?.map(parseFloat))
      .flat();
    if (coords.length && caption) {
      yield [caption, coords] as [string, EnvelopeCoordinates];
    }
  }
}

/**
 * Gets WGS 84 Bounding Box coordinates from EPSG.io page
 * @returns A mapping of names and bounding box coordinates.
 */
function getWgs84BoundingBoxCoords() {
  const p =
    document.body.querySelectorAll<HTMLParagraphElement>("#mini-map ~ p");
  if (!p) {
    throw new TypeError(
      `No elements matching the specified selector were found.`
    );
  }
  const coordsMap =  new Map([...getCoordsFromParagraphs(...p)]);
  return coordsMap;
}

function addTableToPage(coords: Map<string, EnvelopeCoordinates>) {
    const table = createTable(coords);

    console.log(`table has ${table.rows.length} rows`);

    const node = document.body.querySelector("#mini-map")?.parentElement;

    if (node) {
        node.append(table);
    } else {
        console.warn("Couldn't find target node")
    }

}

const coords = getWgs84BoundingBoxCoords();

addTableToPage(coords);

console.log(coords);


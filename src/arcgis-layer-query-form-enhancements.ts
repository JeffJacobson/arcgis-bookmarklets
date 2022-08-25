/**
 * A bookmarklet that enhances the ArcGIS REST query page with various quality-of-life changes.
 *
 * * Field names are now selected via a multi-option select element rather than requiring the user to type a comma-separated list of field names that they have to look up themselves.
 * * Gives the user the option of not setting query parameters that they don't need.
 *   * Added "None" option to select elements (drop-downs) for non-required parameters. (E.g., "f" is a required parameter for the query, so it does not get a "None" option in its select element.)
 *   * Similarly, "true" and "false" radio buttons gain a third option which allows the user to leave the setting unset rather than be forced to choose a value.
 * * Adds a link to the top of the page that will clean-up the URL by removing search parameters from the URL that have no value.
 * * Submitting the form will now open the results in a new browser tab rather than replacing the current one.
 * * Adds a reset button to the form.
 * * Spatial Reference input changes (`outSR` and `inSR`)
 *   * Adds suggestions to the text input via [datalist](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/datalist) elements. Includes the following options. (Descriptions come from <https://epsg.io>.)
 *     * [4326]: "WGS 84 -- WGS84 - World Geodetic System 1984, used in GPS"
 *     * [3857]: "WGS 84 / Pseudo-Mercator -- Spherical Mercator, Google Maps, OpenStreetMap, Bing, ArcGIS, ESRI"
 *     * [2927]: "NAD83(HARN) / Washington South (ftUS)"
 *
 * [4326]:https://epsg.io/4326
 * [2927]:https://epsg.io/2927
 * [3857]:https://epsg.io/3857
 */

import { enhanceQueryForm } from "./modules/arcgis/index.js";

enhanceQueryForm(document.forms[0]);

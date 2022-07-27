# ArcGIS Bookmarklets

<!-- 🚨⚠ WARNING: DO NOT EDIT THE README.md FILE. MAKE ALL CHANGES TO README.template.md, as README.md will be overwritten by an automated process. -->

A bookmarklet that enhances the ArcGIS REST query page with various quality-of-life changes.

* Field names are now selected via a multi-option select element rather than requiring the user to type a comma-separated list of field names that they have to look up themselves.
* Gives the user the option of not setting query parameters that they don't need.
  * Added "None" option to select elements (drop-downs) for non-required parameters. (E.g., "f" is a required parameter for the query, so it does not get a "None" option in its select element.)
  * Similarly, "true" and "false" radio buttons gain a third option which allows the user to leave the setting unset rather than be forced to choose a value.
* Adds a link to the top of the page that will clean-up the URL by removing search parameters from the URL that have no value.
* Submitting the form will now open the results in a new browser tab rather than replacing the current one.
* Adds a reset button to the form.
* Spatial Reference input changes (`outSR` and `inSR`)
  * Adds suggestions to the text input via [datalist](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/datalist) elements. Includes the following options. (Descriptions come from <https://epsg.io>.)
    * [4326]: "WGS 84 -- WGS84 - World Geodetic System 1984, used in GPS"
    * [3857]: "WGS 84 / Pseudo-Mercator -- Spherical Mercator, Google Maps, OpenStreetMap, Bing, ArcGIS, ESRI"
    * [2927]: "NAD83(HARN) / Washington South (ftUS)"

## Future ideas

The following are ideas for enhancements that have not yet been implemented.

* Make it easier for users to specify geometry parameters
  * [ ] Allow them to select a point using [epsg.io's "Get position on a map" feature](https://epsg.io/map#srs=2927), which supports various SRs.
* [ ] Add [form validation](https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation#validating_forms_using_javascript) using the [Constraint validation API](https://developer.mozilla.org/en-US/docs/Web/API/Constraint_validation).
  * We can't simply mark the `where` input control as required. While `where` is *usually* required for a query, but not *always*, depending on what other parameters the user has specified.
  * [ ] Validate geometry input is in the correct format.

[4326]:https://epsg.io/4326
[2927]:https://epsg.io/2927
[3857]:https://epsg.io/3857

## How to use

1. To use, create a new bookmark in your web browser and enter the text below as its URL.
2. Each time you visit an ArcGIS Server query page, you can click this bookmarklet to enhance it.

<!-- The bookmarklet URLs will be written below -->

# ArcGIS Bookmarklets

<!-- 🚨⚠ WARNING: DO NOT EDIT THE README.md FILE. MAKE ALL CHANGES TO README.template.md, as README.md will be overwritten by an automated process. -->

A bookmarklet that enhances the ArcGIS REST query page.

* Field names are now selected via a multi-option select element rather than requiring the user to type a comma-separated list of field names that they have to look up themselves.
* Gives the user the option of not setting query parameters that they don't need.
  * Added "None" option to select elements (drop-downs) for non-required parameters. (E.g., "f" is a required parameter for the query, so it does not get a "None" option in its select element.)
  * Similarly, "true" and "false" radio buttons gain a third option which allows the user to leave the setting unset rather than be forced to choose a value.
* Adds a link to the top of the page that will clean-up the URL by removing search parameters from the URL that have no value.
* Submitting the form will now open the results in a new browser tab rather than replacing the current one.
* Adds a reset button to the form.

## Future ideas

The following are ideas for enhancements that have not yet been implemented.

* Spatial Reference input changes (`outSR` and `inSR`)
  * [ ] Add suggestions to the text input via [datalist](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/datalist) elements. Should include the following options. (Descriptions come from <https://epsg.io>.)
    * [4326]: "WGS 84 -- WGS84 - World Geodetic System 1984, used in GPS"
    * [3857]: "WGS 84 / Pseudo-Mercator -- Spherical Mercator, Google Maps, OpenStreetMap, Bing, ArcGIS, ESRI"
    * [2927]: "NAD83(HARN) / Washington South (ftUS)"
  * [ ] Change `type` attribute to `"number"` (from `"text"`). (Double-check docs to make sure that only WKIDs are supported. If WKTs are also supported, then this change would not be desired.)
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

<!-- The {{bookmarklet}} text will be replaced with the bookmarklet URL -->
```javascript
javascript:(async () => { function addNoneOptionToSelects(form = document.forms[0]) { console.group("add 'none' option to selects"); const namesToSkip = ["f", "sqlFormat"].map(s => `[name='${s}']`).join(","); const selects = form.querySelectorAll(`select:not(${namesToSkip})`); console.log("selects", selects); for (const s of selects) { const option = document.createElement("option"); option.value = ""; option.label = "None"; option.textContent = "None"; option.defaultSelected = true; s.appendChild(option); console.log("option added", option); } console.groupEnd(); } function addUnspecifiedRadioButtons(form = document.forms[0]) { const falseRadios = Array.from(form.querySelectorAll("input[type=radio][value='false']")).filter(r => !r.nextElementSibling); if (!falseRadios) return; for (const r of falseRadios) { const newRadio = document.createElement("input"); newRadio.type = "radio"; newRadio.value = ""; newRadio.name = r.name; newRadio.defaultChecked = r.defaultChecked; const newLabel = document.createElement("label"); newLabel.append(newRadio, document.createTextNode("Undefined")); if (r.parentElement && r.parentElement.parentElement) { r.parentElement.parentElement.append(newLabel); } else { throw new ReferenceError("expected parent elements not found"); } } } async function getLayerInfo() { const re = /^.+\/(?:(?:Map)|(?:Feature))Server\/(?<layerId>\d+)\b/i; const match = location.href.match(re); if (!match) { throw new Error("Invalid map service URL format."); } const url = new URL(match[0]); const layerId = match.groups["layerId"]; let layerInfoJson = sessionStorage.getItem(layerId); if (layerInfoJson) { return JSON.parse(layerInfoJson); } url.searchParams.set("f", "json"); const result = await fetch(url.toString()); layerInfoJson = await result.text(); sessionStorage.setItem(layerId, layerInfoJson); const layer = JSON.parse(layerInfoJson); return layer; } function simplifyFieldTypeName(esriFieldTypeName) { const re = /^esriFieldType/i; return esriFieldTypeName.replace(re, ""); } function* getFieldOptions(fields) { for (const field of fields) { if (field.type === "esriFieldTypeGeometry") continue; const option = document.createElement("option"); option.value = field.name; option.classList.add(field.type); const fieldType = simplifyFieldTypeName(field.type); if (field.alias && field.alias !== field.name) { option.label = `${field.alias} (${field.name}) (${fieldType})`; } else { option.label = `${field.name} (${fieldType})`; } option.text = option.label; yield option; } } function createFieldsSelect(...fields) { const select = document.createElement("select"); select.id = "outFieldsSelect"; select.multiple = true; select.append(...getFieldOptions(fields)); return select; } function updateFieldsInputs(form, ...fields) { const fieldsTextBoxes = form.querySelectorAll("input[type=text][name$='Fields'],input[type=text][name$='FieldsForStatistics']"); if (!fieldsTextBoxes) return; for (const fieldsInput of fieldsTextBoxes) { fieldsInput.type = "hidden"; const newFieldsSelect = createFieldsSelect(...fields); fieldsInput.parentElement.append(newFieldsSelect); newFieldsSelect.addEventListener("change", function (ev) { const fieldNames = Array.from(this.selectedOptions, o => o.value).join(","); fieldsInput.value = fieldNames; }); } } function removeEmptyParametersFromUrl(e) { let url = new URL(location.href); const params = Array.from(url.searchParams.entries()).filter(([key, value]) => { return value !== "" && value !== "false" && value !== "esriDefault"; }); const newSearchParams = new URLSearchParams(); for (const [k, v] of params) { newSearchParams.append(k, v); } url = new URL(url.href.replace(/\?.+$/, "")); url.search = newSearchParams.toString(); history.replaceState(null, "", url); e.preventDefault(); } function addUrlCleanupLink(form) { const link = document.createElement("a"); link.href = "#"; link.text = "Cleanup URL"; link.addEventListener("click", removeEmptyParametersFromUrl); const p = document.createElement("p"); p.append(link); form.prepend(p); } function modifyFormHandling(form) { function addResetButton() { let resetButton = form.querySelector("button[type=reset],input[type=reset]"); if (!resetButton) { resetButton = document.createElement("button"); resetButton.type = "reset"; resetButton.innerText = "Reset"; form.querySelector("[type=submit]").parentElement.appendChild(resetButton); } } addResetButton(); form.addEventListener("submit", function (ev) { const submitButton = ev.submitter; const methodRe = /(?:(?:GET)|(?:POST))/gi; const methodMatch = submitButton?.getAttribute("value")?.match(methodRe); this.method = methodMatch ? methodMatch[0] : ""; this.target = "_blank"; }); } const form = document.forms[0]; if (!form.dataset.enhanced) { console.debug("form", form); addUrlCleanupLink(form); addNoneOptionToSelects(form); addUnspecifiedRadioButtons(form); modifyFormHandling(form); getLayerInfo().then(layer => { if (!layer.fields) { throw new TypeError("Expected an layer to have an array of fields."); } updateFieldsInputs(form, ...layer.fields); }); form.dataset.enhanced = "true"; }})();
```

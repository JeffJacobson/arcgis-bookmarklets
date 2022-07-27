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
## arcgis-layer-query-form-enhancements.js

```javascript
javascript:(async () => { const responseTableClass = "response-table"; const helpRootUrl = "../../../../../../sdk/rest/index.html"; const mapServiceHelpUrl = `${helpRootUrl}#/Query_Map_Service_Layer/02ss0000000r000000/`; let helpWindow = null; const srMap = new Map([ [2927, "NAD83(HARN) / Washington South (ftUS)"], [4326, "WGS 84 – WGS84 - World Geodetic System 1984, used in GPS"], [3857, "WGS 84 / Pseudo-Mercator – Spherical Mercator, Google Maps, OpenStreetMap, Bing, ArcGIS, ESRI"] ]); function createSROptionsDataList(srIds = srMap) { const dataList = document.createElement("datalist"); dataList.id = "srdatalist"; const frag = document.createDocumentFragment(); for (const [srid, desc] of srMap) { const option = document.createElement("option"); option.value = srid.toString(); option.text = option.label = `${srid}: ${desc}`; frag.appendChild(option); } dataList.appendChild(frag); return dataList; } function addDataListToSRTextElements(form, datalist, textboxIds = ["inSR", "outSR"]) { const qs = textboxIds.map(id => `input[type=text][name='${id}']`).join(","); const textBoxes = form.querySelectorAll(qs); if (!datalist) { datalist = createSROptionsDataList(); form.appendChild(datalist); } const listId = typeof datalist === "string" ? datalist : datalist.id; for (const tb of textBoxes) { tb.setAttribute("list", listId); } } function scrollToSpan(node, paramName) { console.group(`scroll to span with ${paramName}`); try { const spanList = node.querySelectorAll("td:first-child>span.usertext"); console.debug("matching spans", spanList); const spans = Array.from(spanList).filter(e => e.textContent === paramName); console.debug(`matching spans with ${paramName}`, spans); if (spans.length > 0) { spans[0].parentElement?.scrollIntoView(); } } catch (error) { console.error(error); throw error; } finally { console.groupEnd(); } } function getHelpForParam(ev) { console.group("get help for param"); try { const paramName = this.dataset.param; if (paramName) { if (!helpWindow || helpWindow.closed) { helpWindow = open(this.href, this.target); helpWindow?.addEventListener("load", function (ev) { this.setTimeout(() => scrollToSpan(helpWindow.document, paramName), 1000); }, { passive: true, capture: false }); } else { scrollToSpan(helpWindow.document, paramName); helpWindow.focus(); } ev.preventDefault(); } else { console.warn("could not access paramName"); } } catch (error) { console.error(error); throw error; } finally { console.groupEnd(); } } function createHelpLinks(form) { const labels = form.querySelectorAll("label[for]"); const helpText = "❓"; function addEventHandler(label) { const paramName = label.htmlFor || label.dataset.htmlFor; const a = document.createElement("a"); a.href = mapServiceHelpUrl; a.target = "help"; a.dataset.param = paramName; a.text = helpText; label.append(a); a.addEventListener("click", getHelpForParam); } const selector = "td>label:first-child>input[type=radio][name]"; const elements = Array.from(form.querySelectorAll(selector), rb => { const name = rb.name; const cell = rb.parentElement?.parentElement?.previousElementSibling; cell.dataset.htmlFor = name; return cell; }); for (const label of elements) { addEventHandler(label); } labels.forEach(addEventHandler); } function getFieldByName(featureSet, fieldName) { if (!featureSet.fields) { throw new TypeError("Feature set does not contain a 'fields' property."); } return featureSet.fields.filter(f => f.name === fieldName)[0]; } function* enumerateFields(featureSet, specialFieldNameProperties = [ "objectIdFieldName", "globalIdFieldName", "displayFieldName" ]) { const fieldsToSkip = new Array(); for (const propertyName of specialFieldNameProperties) { if (!(propertyName in featureSet)) continue; const fieldName = featureSet[propertyName]; if (fieldName) { const field = getFieldByName(featureSet, fieldName); fieldsToSkip.push(field.name); yield field; } } const orderedFieldNames = Array.of(...fieldsToSkip); const unyieldedFields = featureSet.fields?.filter(f => !(f.name in fieldsToSkip)) || []; for (const field of unyieldedFields) { orderedFieldNames.push(field.name); yield field; } return orderedFieldNames; } function createTableHeading(field) { const th = document.createElement("th"); th.scope = "col"; if (typeof field === "string") { th.textContent = field; th.dataset.fieldName = field; } else { th.textContent = field.alias || field.name; th.dataset.fieldName = field.name; } return th; } function createTableCell(feature, field) { const cell = document.createElement("td"); cell.textContent = feature.attributes[field.name]; return cell; } function createTable(queryResponse) { const table = document.createElement("table"); const frag = document.createDocumentFragment(); frag.append(table); table.classList.add(responseTableClass); const thead = table.createTHead(); const theadRow = thead.insertRow(); const fields = Array.from(enumerateFields(queryResponse)); theadRow.append(...fields.map(createTableHeading)); const tbody = table.createTBody(); for (const feature of queryResponse.features) { const row = tbody.insertRow(); for (const field of fields) { const cell = createTableCell(feature, field); row.appendChild(cell); } } return frag; } function addNoneOptionToSelects(form = document.forms[0]) { console.group("add 'none' option to selects"); const namesToSkip = ["f"].map(s => `[name='${s}']`).join(","); const selects = form.querySelectorAll(`select:not(${namesToSkip})`); const labelText = "Unset"; console.log("selects", selects); for (const s of selects) { const option = document.createElement("option"); option.value = ""; option.label = labelText; option.textContent = labelText; option.defaultSelected = true; s.appendChild(option); console.log("option added", option); } console.groupEnd(); } function addUnspecifiedRadioButtons(form = document.forms[0]) { const falseRadios = Array.from(form.querySelectorAll("input[type=radio][value='false']")).filter(r => !r.nextElementSibling); if (!falseRadios) return; for (const r of falseRadios) { const newRadio = document.createElement("input"); newRadio.type = "radio"; newRadio.value = ""; newRadio.name = r.name; newRadio.defaultChecked = r.defaultChecked; const newLabel = document.createElement("label"); newLabel.append(newRadio, document.createTextNode("Unset")); if (r.parentElement && r.parentElement.parentElement) { r.parentElement.parentElement.append(newLabel); } else { throw new ReferenceError("expected parent elements not found"); } } } async function getLayerInfo() { const re = /^.+\/(?:(?:Map)|(?:Feature))Server\/(?<layerId>\d+)\b/i; const match = location.href.match(re); if (!match) { throw new Error("Invalid map service URL format."); } const url = new URL(match[0]); const layerId = match.groups["layerId"]; let layerInfoJson = sessionStorage.getItem(layerId); if (layerInfoJson) { return JSON.parse(layerInfoJson); } url.searchParams.set("f", "json"); const result = await fetch(url.toString()); layerInfoJson = await result.text(); sessionStorage.setItem(layerId, layerInfoJson); const layer = JSON.parse(layerInfoJson); return layer; } function simplifyFieldTypeName(esriFieldTypeName) { const re = /^esriFieldType/i; return esriFieldTypeName.replace(re, ""); } function* getFieldOptions(fields) { for (const field of fields) { if (field.type === "esriFieldTypeGeometry") continue; const option = document.createElement("option"); option.value = field.name; option.classList.add(field.type); const fieldType = simplifyFieldTypeName(field.type); if (field.alias && field.alias !== field.name) { option.label = `${field.alias} (${field.name}) (${fieldType})`; } else { option.label = `${field.name} (${fieldType})`; } option.text = option.label; yield option; } } function createFieldsSelect(...fields) { const select = document.createElement("select"); select.id = "outFieldsSelect"; select.multiple = true; select.append(...getFieldOptions(fields)); return select; } function updateFieldsInputs(form, ...fields) { const fieldsTextBoxes = form.querySelectorAll("input[type=text][name$='Fields'],input[type=text][name$='FieldsForStatistics']"); if (!fieldsTextBoxes) return; for (const fieldsInput of fieldsTextBoxes) { fieldsInput.type = "hidden"; const newFieldsSelect = createFieldsSelect(...fields); fieldsInput.parentElement.append(newFieldsSelect); newFieldsSelect.addEventListener("change", function (ev) { const fieldNames = Array.from(this.selectedOptions, o => o.value).join(","); fieldsInput.value = fieldNames; }); } } function removeEmptyParametersFromUrl(e) { let url = new URL(location.href); const params = Array.from(url.searchParams.entries()).filter(([key, value]) => { return value !== "" && value !== "false" && value !== "esriDefault"; }); const newSearchParams = new URLSearchParams(); for (const [k, v] of params) { newSearchParams.append(k, v); } url = new URL(url.href.replace(/\?.+$/, "")); url.search = newSearchParams.toString(); history.replaceState(null, "", url); e.preventDefault(); } function addUrlCleanupLink(form) { const link = document.createElement("a"); link.href = "#"; link.text = "Cleanup URL"; link.addEventListener("click", removeEmptyParametersFromUrl); const p = document.createElement("p"); p.append(link); form.prepend(p); } function modifyFormHandling(form) { function addResetButton() { let resetButton = form.querySelector("button[type=reset],input[type=reset]"); if (!resetButton) { resetButton = document.createElement("button"); resetButton.type = "reset"; resetButton.innerText = "Reset"; form.querySelector("[type=submit]").parentElement.appendChild(resetButton); } } addResetButton(); form.addEventListener("submit", function (ev) { const submitButton = ev.submitter; const methodRe = /(?:(?:GET)|(?:POST))/gi; const methodMatch = submitButton?.getAttribute("value")?.match(methodRe); this.method = methodMatch ? methodMatch[0].toLowerCase() : ""; this.target = "_blank"; }); } function enhanceTimeInput(form) { const re = /(?<start>\d+)(?:,\s*(?<end>\d+))?/; const timeInput = form.querySelector("input[name='time']"); if (timeInput) { timeInput.pattern = re.source; } return timeInput; } const form = document.forms[0]; if (!form.dataset.enhanced) { form.where.placeholder = `Use "1=1" to query all records.`; addDataListToSRTextElements(form); createHelpLinks(form); console.debug("form", form); addUrlCleanupLink(form); addNoneOptionToSelects(form); addUnspecifiedRadioButtons(form); modifyFormHandling(form); enhanceTimeInput(form); getLayerInfo().then(layer => { if (!layer.fields) { throw new TypeError("Expected an layer to have an array of fields."); } updateFieldsInputs(form, ...layer.fields); }); form.dataset.enhanced = "true"; }})();
```

## get-coors-from-epsg-io.js

```javascript
javascript:(() => { const re = /-?\d+(?:\.\d+)/g; function* getCoordsFromParagraphs(...paragraphs) { for (const p of paragraphs) { const caption = p.querySelector(".caption")?.textContent?.replace(/:$/, "") || null; const coords = [...p.childNodes] .filter((n) => n instanceof Text || n instanceof HTMLSpanElement) .map((t) => { let matches = t.textContent?.matchAll(re); if (!matches) return null; const output = new Array(); for (const m of matches) { output.push(m); } return output.flat(); }) .filter((match) => !!match) .map((match) => match?.map(parseFloat)) .flat(); if (coords.length && caption) { yield [caption, coords]; } } } function getWgs84BoundingBoxCoords() { const p = document.body.querySelectorAll("#mini-map ~ p"); if (!p) { throw new TypeError(`No elements matching the specified selector were found.`); } const coordsMap = {}; for (const [name, value] of getCoordsFromParagraphs(...p)) { coordsMap[name] = value; } return coordsMap; } const coords = getWgs84BoundingBoxCoords(); console.log(coords);})();
```

import { IField, ILayerDefinition } from "@esri/arcgis-rest-feature-service";
import { modifyFormHandling } from "./formSubmitUtils.js";
import { createHelpLinks } from "./helpUtils.js";

const srMap = new Map<number, string>([
  [2927, "NAD83(HARN) / Washington South (ftUS)"],
  [4326, "WGS 84 - WGS84 - World Geodetic System 1984, used in GPS"],
  [
    3857,
    "WGS 84 / Pseudo-Mercator - Spherical Mercator, Google Maps, OpenStreetMap, Bing, ArcGIS, ESRI",
  ],
]);

/**
 * Creates data list for inSR/outSR text box inputs.
 * @param srIds A Map of WKID values and corresponding text descriptions.
 * @returns An HTML datalist element.
 */
function createSROptionsDataList(srIds: Map<number, string> = srMap) {
  const dataList = document.createElement("datalist");
  dataList.id = "srdatalist";
  const frag = document.createDocumentFragment();
  for (const [srid, desc] of srIds) {
    const option = document.createElement("option");
    option.value = srid.toString();
    option.text = option.label = `${srid}: ${desc}`;
    frag.appendChild(option);
  }
  dataList.appendChild(frag);
  return dataList;
}

/**
 * Adds suggestions for the spatial reference text boxes.
 * @param form HTML form that to which the datalist will be added
 * @param datalist Either an HTML datalist or its id value.
 * If omitted, a new datalist will be created.
 * @param textboxIds The element IDs of the text boxes that will use the datalist.
 */
export function addDataListToSRTextElements(
  form: HTMLFormElement,
  datalist?: string | HTMLDataListElement,
  textboxIds = ["inSR", "outSR"]
) {
  // Get the textboxes matching the given ids.
  const qs = textboxIds.map((id) => `input[type=text][name='${id}']`).join(",");
  const textBoxes = form.querySelectorAll<HTMLInputElement>(qs);

  // Create the datalist if parameter wasn't provided.
  if (!datalist) {
    datalist = createSROptionsDataList();
    form.appendChild(datalist);
  }
  const listId = typeof datalist === "string" ? datalist : datalist.id;
  for (const tb of textBoxes) {
    tb.setAttribute("list", listId);
  }
}

/**
 * Uses the History API to clean up the URL currently displayed in the browser
 * by removing all of the parameters that are set to an empty string.
 * @param this HTML Anchor element that was clicked.
 * @param e Click event
 */
function removeEmptyParametersFromUrl(this: HTMLAnchorElement, e: Event) {
  // Get the current URL.
  let url = new URL(location.href);
  // Get the names of params that are not empty or otherwise should not be removed.
  const params = Array.from(url.searchParams.entries()).filter(([, value]) => {
    return value !== "" && value !== "false" && value !== "esriDefault";
  });

  // Create a new URLSearchParams object and
  // populate with only the filtered list
  // of params.
  const newSearchParams = new URLSearchParams();
  for (const [k, v] of params) {
    newSearchParams.append(k, v);
  }

  // Create the new URL and set its search to
  // the filtered list of parameters.
  url = new URL(url.href.replace(/\?.+$/, ""));
  url.search = newSearchParams.toString();
  history.replaceState(null, "", url);

  e.preventDefault();
}

/**
 * Adds a link to the query page that will clean up the URL using
 * the History API.
 * @param form The form on the query page
 */
export function addUrlCleanupLink(form: HTMLFormElement) {
  const link = document.createElement("a");
  link.href = "#";
  link.text = "Cleanup URL";
  link.addEventListener("click", removeEmptyParametersFromUrl);
  const p = document.createElement("p");
  p.append(link);
  form.prepend(p);
}

/**
 * Adds "None" options (with value of an empty string)
 * to the select boxes (except for "f", which is a required parameter).
 */
export function addNoneOptionToSelects(form = document.forms[0]) {
  console.group("add 'none' option to selects");
  const namesToSkip = ["f"].map((s) => `[name='${s}']`).join(",");
  const selects = form.querySelectorAll(`select:not(${namesToSkip})`);
  const labelText = "Unset";

  console.log("selects", selects);
  for (const s of selects) {
    const option = document.createElement("option");
    option.value = "";
    option.label = labelText;
    option.textContent = labelText;
    option.defaultSelected = true;
    s.appendChild(option);
    console.log("option added", option);
  }
  console.groupEnd();
}

function simplifyFieldTypeName(esriFieldTypeName: string) {
  const re = /^esriFieldType/i;
  return esriFieldTypeName.replace(re, "");
}

/**
 * Converts {@link: IField}s to {@link HTMLOptionElement}s
 * @param fields A collection of field objects
 */
function* getFieldOptions(fields: IField[]) {
  for (const field of fields) {
    if (field.type === "esriFieldTypeGeometry") continue;
    const option = document.createElement("option");
    option.value = field.name;
    option.classList.add(field.type);
    const fieldType = simplifyFieldTypeName(field.type);
    if (field.alias && field.alias !== field.name) {
      option.label = `${field.alias} (${field.name}) (${fieldType})`;
    } else {
      option.label = `${field.name} (${fieldType})`;
    }
    option.text = option.label;
    yield option;
  }
}

/**
 * Creates an {@link HTMLSelectElement} element from which
 * the user can choose multiple fields.
 * @param fields An array of fields
 * @returns A select element with field options.
 */
function createFieldsSelect(...fields: IField[]) {
  const select = document.createElement("select");
  select.id = "outFieldsSelect";
  select.multiple = true;
  select.append(...getFieldOptions(fields));
  return select;
}

export function updateFieldsInputs(form: HTMLFormElement, ...fields: IField[]) {
  const fieldsTextBoxes = form.querySelectorAll<HTMLInputElement>(
    "input[type=text][name$='Fields'],input[type=text][name$='FieldsForStatistics']"
  );
  // Exit if no matches were found.
  if (!fieldsTextBoxes) return;

  for (const fieldsInput of fieldsTextBoxes) {
    // Change type from text to hidden.
    fieldsInput.type = "hidden";

    // Add a fields select that the user will interact with instead of the
    // text box.
    const newFieldsSelect = createFieldsSelect(...fields);
    fieldsInput.parentElement?.append(newFieldsSelect);

    // Update the hidden input when the user selects fields
    // in the new select.
    newFieldsSelect.addEventListener("change", function (this, ev) {
      const fieldNames = Array.from(this.selectedOptions, (o) => o.value).join(
        ","
      );
      fieldsInput.value = fieldNames;
    });
  }
}

/**
 * Adds an additional "Unset" radio button in addition to the true and false ones.
 */
export function addUnspecifiedRadioButtons(form = document.forms[0]) {
  // Get all of the radio buttons with a value of "false" and do not
  // have a sibling element after them.
  const falseRadios = Array.from(
    form.querySelectorAll<HTMLInputElement>("input[type=radio][value='false']")
  ).filter((r) => !r.nextElementSibling);
  // Exit if there are no radio buttons that meet the criteria.
  if (!falseRadios) return;

  for (const r of falseRadios) {
    const newRadio = document.createElement("input");
    newRadio.type = "radio";
    newRadio.value = "";
    newRadio.name = r.name;
    // newRadio.checked = true;
    newRadio.defaultChecked = r.defaultChecked;

    const newLabel = document.createElement("label");
    newLabel.append(newRadio, document.createTextNode("Unset"));

    if (r.parentElement && r.parentElement.parentElement) {
      r.parentElement.parentElement.append(newLabel);
    } else {
      throw new ReferenceError("expected parent elements not found");
    }
  }
}

export function setPlaceholderForWhere(form: HTMLFormElement) {
  (
    form.where as HTMLInputElement
  ).placeholder = `Use "1=1" to query all records.`;
}

// /**
//  * Get the field names from a feature's attributes.
//  * This can be used if a {@link IQueryFeaturesResponse}
//  * does not contain a {@link IQueryFeaturesResponse.fields} property.
//  * @param feature A feature
//  */
// function* getFieldNamesFromFeature(feature: IFeature) {
//   for (const attributeName in feature.attributes) {
//     yield attributeName;
//   }
// }

/**
 * Enhances the "time" control.
 * @param form A form
 * @returns Returns the time control (or null if it could not be found).
 */
export function enhanceTimeInput(form: HTMLFormElement) {
  const re = /(?<start>\d+)(?:,\s*(?<end>\d+))?/;
  const timeInput = form.querySelector<HTMLInputElement>("input[name='time']");
  if (timeInput) {
    timeInput.pattern = re.source;
  }
  return timeInput;
}

/**
 * Queries the feature layer for its field names.
 * Retrieves from session storage if available.
 * Otherwise will query the map service layer.
 */
export async function getLayerInfo() {
  const re = /^.+\/(?:(?:Map)|(?:Feature))Server\/(?<layerId>\d+)\b/i;
  const match = location.href.match(re);
  if (!(match && match.groups)) {
    throw new Error("Invalid map service URL format.");
  }
  const url = new URL(match[0]);
  const layerId = match.groups["layerId"];
  let layerInfoJson = sessionStorage.getItem(layerId);
  if (layerInfoJson) {
    return JSON.parse(layerInfoJson) as ILayerDefinition;
  }
  url.searchParams.set("f", "json");
  const result = await fetch(url.toString());
  layerInfoJson = await result.text();
  sessionStorage.setItem(layerId, layerInfoJson);
  const layer: ILayerDefinition = JSON.parse(layerInfoJson);
  return layer;
}

/**
 * Enhances an ArcGIS query page.
 *
 * * Adds `data-enhanced='true'` attribute to form, which will tell
 * subsequent calls to this function that it has already been
 * enhanced and doesn't need to do anything further.
 * @param form An form on an ArcGIS query page. Only one form is expected on such a page.
 * @example
 * ```typescript
 * enhanceQueryForm(document.forms[0]);
 * ```
 */
export function enhanceQueryForm(form: HTMLFormElement = document.forms[0]) {
  if (!form) {
    throw new TypeError(
      `The value provided for the form parameter is not valid: ${form}.`
    );
  }
  if (!form.dataset.enhanced) {
    setPlaceholderForWhere(form);
    addDataListToSRTextElements(form);
    createHelpLinks(form);
    addUrlCleanupLink(form);
    addNoneOptionToSelects(form);
    addUnspecifiedRadioButtons(form);
    modifyFormHandling(form);
    enhanceTimeInput(form);
    getLayerInfo().then((layer) => {
      if (!layer.fields) {
        throw new TypeError("Expected an layer to have an array of fields.");
      }
      updateFieldsInputs(form, ...layer.fields);
    });
    form.dataset.enhanced = "true";
  }
}

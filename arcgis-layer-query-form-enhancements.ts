import { IField, ILayerDefinition, IQueryFeaturesResponse, IFeature, IFeatureSet } from "@esri/arcgis-rest-feature-service";

// Wrap all bookmarklet code in a self-executing anonymous 
// function to avoid polluting the global scope.
(async () => {
  const responseTableClass = "response-table";

  function getFieldByName(featureSet: IFeatureSet, fieldName: string): IField {
    if (!featureSet.fields) {
      throw new TypeError("Feature set does not contain a 'fields' property.");
    }
    return featureSet.fields.filter(f => f.name === fieldName)[0];
  }

  /**
   * Enumerates through the fields of a feature set, yielding
   * the objectIdFieldName, globalFieldName, and displayFieldName
   * before the rest of the fields.
   * @param featureSet A feature set
   * @param specialFieldNameProperties Specifies the names of properties of featureSet 
   * that denote special fields that should be yielded before the other fields.
   */
  function* enumerateFields(featureSet: IFeatureSet, specialFieldNameProperties = [
    "objectIdFieldName",
    "globalIdFieldName",
    "displayFieldName"
  ]) {
    const fieldsToSkip = new Array<string>();
    // Yield the "special" fields first.
    for (const propertyName of specialFieldNameProperties) {
      if (!(propertyName in featureSet)) continue;
      const fieldName = (featureSet as any)[propertyName];
      if (fieldName) {
        const field = getFieldByName(featureSet, fieldName);
        fieldsToSkip.push(field.name);
        yield field;
      }
    }

    const orderedFieldNames = Array.of(...fieldsToSkip);

    // Yield the rest
    const unyieldedFields = featureSet.fields?.filter(f => !(f.name in fieldsToSkip)) || [];
    for (const field of unyieldedFields) {
      orderedFieldNames.push(field.name);
      yield field;
    }
    return orderedFieldNames;
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

  function createTableHeading(field: IField) {
    const th = document.createElement("th");
    th.scope = "col";
    if (typeof field === "string") {
      th.textContent = field;
      th.dataset.fieldName = field;
    } else {
      th.textContent = field.alias || field.name;
      th.dataset.fieldName = field.name;
    }
    return th;
  }

  function createTableCell(feature: IFeature, field: IField): HTMLTableCellElement {
    const cell = document.createElement("td");
    cell.textContent = feature.attributes[field.name];
    return cell;
  }

  function createTable(queryResponse: IQueryFeaturesResponse) {
    const table = document.createElement("table");
    const frag = document.createDocumentFragment();
    frag.append(table);
    table.classList.add(responseTableClass);
    const thead = table.createTHead();
    const theadRow = thead.insertRow();
    // Get an array of fields.
    const fields = Array.from(enumerateFields(queryResponse));
    // Append th elements for each field.
    theadRow.append(...fields.map(createTableHeading));

    const tbody = table.createTBody();
    for (const feature of queryResponse.features) {
      const row = tbody.insertRow();
      for (const field of fields) {
        const cell = createTableCell(feature, field);
        row.appendChild(cell);
      }
    }

    return frag;
  }


  /**
   * Adds "None" options (with value of an empty string)
   * to the select boxes (except for "f", which is a required parameter).
   */
  function addNoneOptionToSelects(form = document.forms[0]) {
    console.group("add 'none' option to selects");
    const namesToSkip = ["f", "sqlFormat"].map(s => `[name='${s}']`).join(",")
    const selects = form.querySelectorAll(`select:not(${namesToSkip})`);

    console.log("selects", selects);
    for (const s of selects) {
      const option = document.createElement("option");
      option.value = "";
      option.label = "None";
      option.textContent = "None";
      option.defaultSelected = true;
      s.appendChild(option);
      console.log("option added", option);
    }
    console.groupEnd();
  }

  /**
   * Adds an additional "Undefined" radio button in addition to the true and false ones.
   */
  function addUnspecifiedRadioButtons(form = document.forms[0]) {
    // Get all of the radio buttons with a value of "false" and do not
    // have a sibling element after them.
    const falseRadios = Array.from(form.querySelectorAll<HTMLInputElement>("input[type=radio][value='false']")).filter(r => !r.nextElementSibling);
    // Exit if there are no radio buttons that meet the criteria.
    if (!falseRadios) return;

    for (const r of falseRadios) {
      const newRadio = document.createElement("input");
      newRadio.type = "radio";
      newRadio.value = "";
      newRadio.name = r.name;
      // newRadio.checked = true;
      newRadio.defaultChecked = r.defaultChecked

      const newLabel = document.createElement("label");
      newLabel.append(newRadio, document.createTextNode("Undefined"));

      if (r.parentElement && r.parentElement.parentElement) {
        r.parentElement.parentElement.append(newLabel);
      } else {
        throw new ReferenceError("expected parent elements not found");
      }
    }
  }

  /**
   * Queries the feature layer for its field names.
   * Retrieves from session storage if available.
   * Otherwise will query the map service layer.
   */
  async function getLayerInfo() {
    const re = /^.+\/(?:(?:Map)|(?:Feature))Server\/(?<layerId>\d+)\b/i;
    const match = location.href.match(re);
    if (!match) {
      throw new Error("Invalid map service URL format.");
    }
    const url = new URL(match[0]);
    const layerId = match.groups!["layerId"];
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

  function updateFieldsInputs(form: HTMLFormElement, ...fields: IField[]) {
    const fieldsTextBoxes = form.querySelectorAll<HTMLInputElement>("input[type=text][name$='Fields'],input[type=text][name$='FieldsForStatistics']");
    // Exit if no matches were found.
    if (!fieldsTextBoxes) return;

    for (const fieldsInput of fieldsTextBoxes) {
      // Change type from text to hidden.
      fieldsInput.type = "hidden";

      // Add a fields select that the user will interact with instead of the
      // text box.
      const newFieldsSelect = createFieldsSelect(...fields);
      fieldsInput.parentElement!.append(newFieldsSelect);

      // Update the hidden input when the user selects fields 
      // in the new select.
      newFieldsSelect.addEventListener("change", function (this, ev) {
        const fieldNames = Array.from(this.selectedOptions, o => o.value).join(",");
        fieldsInput.value = fieldNames;
      });
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
    const params = Array.from(url.searchParams.entries()).filter(([key, value]) => {
      return value !== "" && value !== "false" && value !== "esriDefault"
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
    url.search = newSearchParams.toString()
    history.replaceState(null, "", url);

    e.preventDefault();
  }

  /**
   * Adds a link to the query page that will clean up the URL using
   * the History API.
   * @param form The form on the query page
   */
  function addUrlCleanupLink(form: HTMLFormElement) {
    const link = document.createElement("a");
    link.href = "#";
    link.text = "Cleanup URL";
    link.addEventListener("click", removeEmptyParametersFromUrl);
    const p = document.createElement("p");
    p.append(link);
    form.prepend(p);
  }

  function modifyFormHandling(form: HTMLFormElement) {
    function addResetButton() {
      let resetButton = form.querySelector<HTMLButtonElement | HTMLInputElement>("button[type=reset],input[type=reset]");
      if (!resetButton) {
        resetButton = document.createElement("button");
        resetButton.type = "reset";
        resetButton.innerText = "Reset";
        form.querySelector("[type=submit]")!.parentElement!.appendChild(resetButton);
      }
    }

    addResetButton();

    form.addEventListener("submit", function (this, ev) {
      // Determine which form submit button the user clicked (GET or POST).
      const submitButton = ev.submitter;
      const methodRe = /(?:(?:GET)|(?:POST))/gi;
      const methodMatch = submitButton?.getAttribute("value")?.match(methodRe);
      // Set the form method to match the button that was clicked.
      // If the method isn't "GET" or "POST" (a situation which shouldn't occur)
      // Set the method to an empty string.
      this.method = methodMatch ? methodMatch[0].toLowerCase() : "";
      // Change the form target so the query opens in a new window.
      this.target = "_blank";


      const format = (this.f as HTMLSelectElement).value;
      if (format !== "html" || this.method !== "get") {
        return;
      }



      // TODO: for GET requests, clean up the URL and open this URL rather than the default form submit behavior.

      // Get all named elements with values and
      // create a mapping of the controls' name/values.

      const queryParameters = new URLSearchParams(
        Array.from(
          this.querySelectorAll<HTMLInputElement>("input[type=radio][checked],input:not([type=radio]),textarea"))
          .filter(input => input.name && input.value !== "")
          .map(input => [input.name, input.value])
      );

      // User has specified HTML output, but we need to get JSON and then we'll
      // generate HTML ourselves.
      queryParameters.set("f", "json");

      // Create a new URL
      const url = new URL(location.href.split("?")[0]);
      // Add the parameters to the URL.
      url.search = queryParameters.toString();

      fetch(url.href).then(async (response) => {
        const queryResponse: IQueryFeaturesResponse = await response.json();
        try {
          const tableFrag = createTable(queryResponse);
          const selector = `table.${responseTableClass}`;
          // Remove existing result tables if they exist.
          document.body.querySelectorAll(selector).forEach(element => { element.remove() });
          document.body.append(tableFrag);
          document.body.querySelector(selector)?.scrollIntoView();
          // Update the URL
        } catch (error) {
          if (error instanceof DOMException) {
            console.error("An error occurred creating the table", error);
          } else {
            throw error;
          }
        }
        try {
          history.pushState({ url: url.href, response: queryResponse }, "", url);
        } catch (error) {
          if (error instanceof DOMException) {
            console.error("Error pushing history state", error);
          } else {
            throw error;
          }
        }
      }, error => {
        alert("An error was encountered. See console for details.");
        console.error(error);
      });

      ev.preventDefault();
    });
  }

  const form = document.forms[0];
  if (!form.dataset.enhanced) {
    console.debug("form", form);
    addUrlCleanupLink(form);
    addNoneOptionToSelects(form);
    addUnspecifiedRadioButtons(form);
    modifyFormHandling(form);
    getLayerInfo().then(layer => {
      if (!layer.fields) {
        throw new TypeError("Expected an layer to have an array of fields.");
      }
      updateFieldsInputs(form, ...layer.fields);
    });
    form.dataset.enhanced = "true";
  }
})();
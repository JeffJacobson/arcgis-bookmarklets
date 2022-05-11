import { IField, ILayerDefinition } from "@esri/arcgis-rest-feature-service";

(async () => {
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
      // Get all named elements with values and
      // create a mapping of the controls' name/values.

      const submitButton = ev.submitter;
      const methodRe = /(?:(?:GET)|(?:POST))/gi;
      const methodMatch = submitButton?.getAttribute("value")?.match(methodRe);
      this.method = methodMatch ? methodMatch[0] : "";
      this.target = "_blank";

      const queryParameters = new URLSearchParams(
        Array.from(
        this.querySelectorAll<HTMLInputElement>("input[type=radio][checked],input:not([type=radio]),textarea"))
        .filter(input => input.name && input.value !== "")
        .map(input => [input.name, input.value])
      );

      // // Create a new URL
      // const url = new URL(location.href.split("?")[0]);
      // // Add the parameters to the URL.
      // url.search = queryParameters.toString();
      // // Open the URL in a new window.
      // open(url, "_blank");
      // ev.preventDefault();
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
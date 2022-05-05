(async () => {
  /**
   * Adds "None" options (with value of an empty string)
   * to the select boxes (except for "f", which is a required parameter).
   */
  function addNoneOptionToSelects() {
    // Append "None" options to selects.
    const form = document.forms[0];
    const selects = form.querySelectorAll("select");
    for (const s of selects) {
      // "f" is required parameter,
      // so it will not get the "none" option.
      if (s.name === "f") continue;
      const option = document.createElement("option");
      option.value = "";
      option.label = "None";
      option.textContent = "None";
      option.selected = true;
      s.appendChild(option);
    }
  }

  /**
   * Adds an additional "Undefined" radio button in addition to the true and false ones.
   */
  function addUnspecifiedRadioButtons() {
    // Get all of the radio buttons with a value of "false" and do not
    // have a sibling element after them.
    const falseRadios = Array.from(document.forms[0].querySelectorAll("input[type=radio][value='false']")).filter(r => !r.nextElementSibling);
    // Exit if there are no radio buttons that meet the criteria.
		if (!falseRadios) return;
    
    for (const r of falseRadios) {
      const newRadio = document.createElement("input");
      newRadio.type = "radio";
      newRadio.value = "";
      newRadio.name = r.name;
      newRadio.checked = true;
      
      const newLabel = document.createElement("label");
      newLabel.append(newRadio, document.createTextNode("Undefined"));
      
      r.parentElement.parentElement.append(newLabel);
    }
  }
  
  function makeWhereRequired() {
    document.forms[0].where.required = true;
  }
  
  /**
   * Queries the feature layer for its field names.
   * @returns {Promise<string[]>}
   */
  async function getFieldNames() {
    const re = /^.+\/MapServer\/\d+\b/i;
    const match = location.href.match(re);
    if (!match) return;
    
    const excludedFieldTypes = /((OID)|(Geometry))$/ig;
    
    const url = new URL(match[0]);
    url.searchParams.set("f", "json");
    const result = await fetch(url);
    const layer = await result.json();
    const fields = layer.fields
    	.filter(f => !excludedFieldTypes.test(f.type))
    	.map(f => f.name);
    console.log(fields);
    return fields;
  }

  addNoneOptionToSelects();
  addUnspecifiedRadioButtons();
  getFieldNames().then(names => console.log(names.join(",")));
})();
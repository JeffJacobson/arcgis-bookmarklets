import type { IQueryFeaturesResponse } from "@esri/arcgis-rest-feature-service";
import type { IFeatureSet, IField, IFeature } from "@esri/arcgis-rest-request";

function getFieldByName(featureSet: IFeatureSet, fieldName: string): IField {
    if (!featureSet.fields) {
      throw new TypeError("Feature set does not contain a 'fields' property.");
    }
    return featureSet.fields.filter((f) => f.name === fieldName)[0];
  }
  

export const responseTableClass = "response-table";
/**
 * Enumerates through the fields of a feature set, yielding
 * the objectIdFieldName, globalFieldName, and displayFieldName
 * before the rest of the fields.
 * @param featureSet A feature set
 * @param specialFieldNameProperties Specifies the names of properties of featureSet
 * that denote special fields that should be yielded before the other fields.
 */
function* enumerateFields(
  featureSet: IFeatureSet,
  specialFieldNameProperties = [
    "objectIdFieldName",
    "globalIdFieldName",
    "displayFieldName",
  ]
) {
  const fieldsToSkip = new Array<string>();
  // Yield the "special" fields first.
  for (const propertyName of specialFieldNameProperties) {
    if (!(propertyName in featureSet)) continue;
    const fieldName = (featureSet as unknown as Record<string, string>)[
      propertyName
    ];
    if (fieldName) {
      const field = getFieldByName(featureSet, fieldName);
      fieldsToSkip.push(field.name);
      yield field;
    }
  }

  const orderedFieldNames = Array.of(...fieldsToSkip);

  // Yield the rest
  const unyieldedFields =
    featureSet.fields?.filter((f) => !(f.name in fieldsToSkip)) || [];
  for (const field of unyieldedFields) {
    orderedFieldNames.push(field.name);
    yield field;
  }
  return orderedFieldNames;
}

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

function createTableCell(
  feature: IFeature,
  field: IField
): HTMLTableCellElement {
  const cell = document.createElement("td");
  cell.textContent = feature.attributes[field.name];
  return cell;
}

export function createTable(queryResponse: IQueryFeaturesResponse) {
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

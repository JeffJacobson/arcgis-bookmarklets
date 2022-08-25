// <form action="/arcgis/rest/services/Shared/ElcRestSOE/MapServer/exts/ElcRestSoe/Find%20Route%20Locations">

function transferProperties(
  source: HTMLElement,
  dest: HTMLElement,
  ...attributeNames: string[]
) {
  for (const aName of attributeNames) {
    if (Object.prototype.hasOwnProperty.call(source, aName)) {
      (dest as unknown as Record<string, string>)[aName] = (
        source as unknown as Record<string, string>
      )[aName];
    }
  }
}

function replaceYearControl(control: HTMLTextAreaElement) {
  const yearInput = document.createElement("input");
  transferProperties(control, yearInput, "name", "id");
  yearInput.pattern = /\d{2}-\d{2}-\d{4}/.source;
  yearInput.placeholder = `Either "Current" or, e.g., ${
    new Date().getFullYear
  }`;
  control.replaceWith(yearInput);
  return yearInput;
}

function replaceDateControl(control: HTMLTextAreaElement) {
  const datePicker = document.createElement("input");
  datePicker.type = "date";
  transferProperties(control, datePicker, "name", "id");
  control.replaceWith(datePicker);
  return datePicker;
}

/**
 * Enhances an ELC page.
 * @param form
 * @returns
 */
export function setupElcPage(form?: HTMLFormElement) {
  if (!form) {
    form =
      document.querySelector<HTMLFormElement>("form[action*='exts/ELC'i]") ||
      undefined;
  }
  if (!form) {
    return;
  }

  // Get the input controls.
  const controls = form.querySelectorAll<HTMLTextAreaElement>(
    "tr > td:nth-child(2) > textarea:first-child"
  );

  for (const control of controls) {
    if (/Date$/i.test(control.id)) {
      replaceDateControl(control);
    } else if (/^lrsYear$/i.test(control.id)) {
      replaceYearControl(control);
    }
  }
}

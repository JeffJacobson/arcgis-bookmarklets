// <form action="/arcgis/rest/services/Shared/ElcRestSOE/MapServer/exts/ElcRestSoe/Find%20Route%20Locations">

export function setupElcPage(form?: HTMLFormElement) {
  if (!form) {
    form =
      document.querySelector<HTMLFormElement>("form[action*='exts/ELC'i]") ||
      undefined; // cspell ignore-line
  }
  if (!form) {
    return;
  }

  // Get the input controls.
  const controls = form.querySelectorAll<HTMLTextAreaElement>(
    "tr > td:nth-child(2) > textarea:first-child"
  );

  for (const control of controls) {
    if (control.id.match(/Date$/i)) {
      const datePicker = document.createElement("input");
      datePicker.type = "date";
      datePicker.name = control.name;
      datePicker.id = control.id;
      control.replaceWith(datePicker);
    }
  }
}

/**
 * Modifies what an ArcGIS query form does when a user submits it.
 * @param form - A form on an ArcGIS query page.
 */
export function modifyFormHandling(form: HTMLFormElement) {
  function addResetButton() {
    let resetButton = form.querySelector<HTMLButtonElement | HTMLInputElement>(
      "button[type=reset],input[type=reset]"
    );
    if (!resetButton) {
      resetButton = document.createElement("button");
      resetButton.type = "reset";
      resetButton.innerText = "Reset";
      form
        .querySelector("[type=submit]")
        ?.parentElement?.appendChild(resetButton);
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

    // // for GET requests, clean up the URL and open this URL rather than the default form submit behavior.

    // const format = (this.f as HTMLSelectElement).value;
    // if (format !== "html" || this.method !== "get") {
    //   return;
    // }

    // // Get all named elements with values and
    // // create a mapping of the controls' name/values.

    // const queryParameters = new URLSearchParams(
    //   Array.from(
    //     this.querySelectorAll<HTMLInputElement>("input[type=radio][checked],input:not([type=radio]),textarea"))
    //     .filter(input => input.name && input.value !== "")
    //     .map(input => [input.name, input.value])
    // );

    // // User has specified HTML output, but we need to get JSON and then we'll
    // // generate HTML ourselves.
    // queryParameters.set("f", "json");

    // // Create a new URL
    // const url = new URL(location.href.split("?")[0]);
    // // Add the parameters to the URL.
    // url.search = queryParameters.toString();

    // fetch(url.href).then(async (response) => {
    //   const queryResponse: IQueryFeaturesResponse = await response.json();
    //   try {
    //     const tableFrag = createTable(queryResponse);
    //     const selector = `table.${responseTableClass}`;
    //     // Remove existing result tables if they exist.
    //     document.body.querySelectorAll(selector).forEach(element => { element.remove() });
    //     document.body.append(tableFrag);
    //     document.body.querySelector(selector)?.scrollIntoView();
    //     // Update the URL
    //   } catch (error) {
    //     if (error instanceof DOMException) {
    //       console.error("An error occurred creating the table", error);
    //     } else {
    //       throw error;
    //     }
    //   }
    //   try {
    //     // Set "f" back to "html" before pushing history state.
    //     url.searchParams.set("f", "html");
    //     history.pushState({ url: url.href, response: queryResponse }, "", url);
    //   } catch (error) {
    //     if (error instanceof DOMException) {
    //       console.error("Error pushing history state", error);
    //     } else {
    //       throw error;
    //     }
    //   }
    // }, error => {
    //   alert("An error was encountered. See console for details.");
    //   console.error(error);
    // });

    // ev.preventDefault();
  });
}

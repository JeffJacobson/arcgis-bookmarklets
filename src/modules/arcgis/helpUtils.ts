/**
 * Functions for generating help links on ArcGIS form.
 */

let helpWindow: Window | null = null;

const helpRootUrl = "../../../../../../sdk/rest/index.html";

const mapServiceHelpUrl = `${helpRootUrl}#/Query_Map_Service_Layer/02ss0000000r000000/`;

/**
 *
 * @param node The HTML Window that will be scrolled.
 * @param paramName The name of the ArcGIS query
 * parameter to scroll to in the documentation.
 */
function scrollToSpan(node: ParentNode, paramName: string) {
  // Get the spans containing parameter names and filter
  // to only the one with the desired parameter name.
  console.group(`scroll to span with ${paramName}`);
  try {
    const spanList = node.querySelectorAll("td:first-child>span.usertext");
    console.debug("matching spans", spanList);
    const spans = Array.from(spanList).filter(
      (e) => e.textContent === paramName
    );
    console.debug(`matching spans with ${paramName}`, spans);
    if (spans.length > 0) {
      // Get the parent element (table cell) of
      // the span with the parameter name.
      // Scroll to this element.
      spans[0].parentElement?.scrollIntoView();
    }
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    console.groupEnd();
  }
}

/**
 * Opens a help window for a query parameter.
 * @param this The <a> that was clicked.
 * * The href will be a help page on the same server.
 * * The dataset of the a element should contain a "param" (a "data-param" attribute).
 * @param ev The click event. This function currently does not make use of this parameter.
 */
function getHelpForParam(this: HTMLAnchorElement, ev: Event) {
  console.group("get help for param");
  try {
    const paramName = this.dataset.param;
    if (paramName) {
      // Scroll to the given parameter's documentation in the help window.
      // Open a new help window if necessary.
      if (!helpWindow || helpWindow.closed) {
        helpWindow = open(this.href, this.target);

        // All of the content is not in the page when loaded.
        // Wait for 1 second before attempting to scroll.
        // (An alternative approach would be to use a MutationObserver.)
        helpWindow?.addEventListener(
          "load",
          function (this, ev) {
            this.setTimeout(() => scrollToSpan(this.document, paramName), 1000);
          },
          { passive: true, capture: false }
        );
      } else {
        // The window already exists, so we can scroll without waiting.
        scrollToSpan(helpWindow.document, paramName);
        // Switch to the help window.
        helpWindow.focus();
      }
      // Stop the default behavior of clicking a link.
      ev.preventDefault();
    } else {
      console.warn("could not access paramName");
    }
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    console.groupEnd();
  }
}

/**
 * Creates help links for labels for query parameter inputs.
 * @param form A form
 */
export function createHelpLinks(form: HTMLFormElement) {
  const labels = form.querySelectorAll<HTMLLabelElement>("label[for]");
  const helpText = "❓";

  function addEventHandler(label: HTMLElement) {
    const paramName =
      (label as HTMLLabelElement).htmlFor || label.dataset.htmlFor;
    const a = document.createElement("a");
    a.href = mapServiceHelpUrl;
    a.target = "help";
    a.dataset.param = paramName;
    a.text = helpText;
    label.append(a);
    a.addEventListener("click", getHelpForParam);
  }

  // TODO: Radio buttons currently aren't supported by this function, as
  // they do not have labels with "for" attributes.

  // Get the radio buttons that have a name element and are contained in a label
  // that is the first child.
  const selector = "td>label:first-child>input[type=radio][name]";
  // Get the labels that will have a help link added to them.
  const elements = Array.from(
    form.querySelectorAll<HTMLInputElement>(selector),
    (rb) => {
      const name = rb.name;
      const cell = rb.parentElement?.parentElement
        ?.previousElementSibling as HTMLElement;
      cell.dataset.htmlFor = name;
      return cell;
    }
  );

  for (const label of elements) {
    addEventHandler(label);
  }

  labels.forEach(addEventHandler);
}


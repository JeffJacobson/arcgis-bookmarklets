# ArcGIS Bookmarklets

<!-- 🚨⚠ WARNING: DO NOT EDIT THE README.md FILE. MAKE ALL CHANGES TO README.template.md, as README.md will be overwritten by an automated process. -->

A bookmarklet that enhances the ArcGIS REST query page.

* Field names are now selected via a multi-option select element rather than requiring the user to type a comma-separated list of field names that they have to look up themselves.
* Gives the user the option of not setting query parameters that they don't need.
  * Added "None" option to select elements (drop-downs) for non-required parameters. (E.g., "f" is a required parameter for the query, so it does not get a "None" option in its select element.)
  * Similarly, "true" and "false" radio buttons gain a third option which allows the user to leave the setting unset rather than be forced to choose a value.
* Adds a link to the top of the page that will clean-up the URL by removing search parameters from the URL that have no value.
* Submitting the form will now open the results in a new browser tab rather than replacing the current one.

To use, create a new bookmark in your web browser and enter the text below as its URL.

<!-- The {{bookmarklet}} text will be replaced with the bookmarklet URL -->
{{bookmarklets}}

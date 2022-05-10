import { readFile, writeFile } from "fs/promises";
import constants from "constants";

let contents = await readFile("arcgis-layer-query-form-enhancements.js", {
    encoding: "utf-8", flag: constants.O_RDONLY
});

// Remove the empty export statement.
contents = contents.replace("export {};", "");

// Remove newlines
contents = contents.replace(/[\n\r]/g, "");
contents = contents.replace(/\s{2,}/g, " ");

contents = `javascript:${contents}`;

await writeFile("output.js", contents);
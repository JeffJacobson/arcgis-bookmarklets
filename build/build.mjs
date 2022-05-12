import { readFile, writeFile } from "fs/promises";
import constants from "constants";
import clipboardy from "clipboardy";

const readOnlyOptions = {
    encoding: "utf-8", flag: constants.O_RDONLY
};

const writeOnlyOptions = {
    encoding: "utf-8",
    flag: constants.O_WRONLY
};

let contents = await readFile("arcgis-layer-query-form-enhancements.js", readOnlyOptions);

// Remove the empty export statement.
contents = contents.replace("export {};", "");

// Remove newlines
contents = contents.replace(/[\n\r]/g, "");
contents = contents.replace(/\s{2,}/g, " ");

contents = `javascript:${contents}`;

const outputFilename = "output.js";
await writeFile(outputFilename, contents);

/**
 * Updates the README.md file with the bookmarklet text.
 * @param {string} bookmarkletText The bookmarklet text to add to the README.md file.
 */
async function updateReadme(bookmarkletText) {
    let readmeTemplate = await readFile("README.template.md", readOnlyOptions);
    
    const readme = readmeTemplate.replace("{{bookmarklets}}", `\`\`\`javascript\n${bookmarkletText}\n\`\`\``);

    await writeFile("README.md", readme, writeOnlyOptions);
}

try {
    await clipboardy.write(contents);
    console.log("📋 Wrote content to clipboard.");
} catch (clipboardError) {
    console.error("⚠ Error writing to clipboard.");
}

// Update the README file
await updateReadme(contents);
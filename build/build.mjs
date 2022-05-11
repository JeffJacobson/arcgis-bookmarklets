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

const outputFilename = "output.js";
await writeFile(outputFilename, contents);

// Update the README file

await updateReadme(contents);

/**
 * Updates the README.md file with the bookmarklet text.
 * @param {string} bookmarkletText The bookmarklet text to add to the README.md file.
 */
async function updateReadme(bookmarkletText) {
    let readmeTemplate = await readFile("README.template.md", {
        encoding: "utf-8",
        flag: constants.O_RDONLY
    });

    const readme = readmeTemplate.replace("{{bookmarklets}}", `\`\`\`javascript\n${bookmarkletText}\n\`\`\``);

    await writeFile("README.md", readme, {
        encoding: "utf-8",
        flag: constants.O_WRONLY
    });
}


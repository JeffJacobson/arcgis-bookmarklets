import { readFile, writeFile, readdir, copyFile, open } from "fs/promises";
import constants from "constants";

const readOnlyOptions = {
    encoding: "utf-8", flag: constants.O_RDONLY
};

const writeOnlyOptions = {
    encoding: "utf-8",
    flag: constants.O_WRONLY
};

/**
 * Updates the README.md file with the bookmarklet text.
 * @param {...string} bookmarkletText The bookmarklet text to add to the README.md file.
 */
async function updateReadme(...bookmarkletText) {
    const outputFile = "README.md";
    await copyFile("README.template.md", outputFile);

    const fileHandle = await open(outputFile, constants.O_APPEND)
    for (const text of bookmarkletText) {
        await fileHandle.appendFile(text);
    }
}

/**
 * Gets the contents of a file.
 * @param {string[]} fileNames
 */
async function* getFileContents(...fileNames) {
    for await (const fileName of fileNames) {

        let contents = await readFile(fileName, readOnlyOptions);

        // Remove the empty export statement.
        contents = contents.replace("export {};", "");

        // Remove newlines
        contents = contents.replace(/[\n\r]/g, "");
        contents = contents.replace(/\s{2,}/g, " ");

        contents = `## ${fileName}

\`\`\`javascript
javascript:${contents}
\`\`\`
`;
        yield contents;
    }
}

const jsFiles = await readdir(".", {
    withFileTypes: true
}).then(dirEnts => {
    return dirEnts.filter(de => de.isFile() && de.name.endsWith(".js")).map(f => f.name);
});

/** @type {string[]} */
const parts = [];

for await (const fileText of getFileContents(...jsFiles)) {
    parts.push(fileText);
}

const outputText = parts.join("\n");

// Update the README file
await updateReadme(outputText);
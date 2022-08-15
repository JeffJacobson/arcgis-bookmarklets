import { readdir, copyFile, open } from "node:fs/promises";
import { O_APPEND } from "node:constants";
import { dirname, join, basename } from "node:path";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
console.debug("__filename", __filename);
const __directory = dirname(__filename)
console.debug("__directory", __directory);

const rootDir = join(__directory, "..");

const srcFiles = await readdir(join(rootDir, "src"), {
    withFileTypes: true
}).then(dirEnts => {
    return dirEnts.filter(de => de.isFile() && de.name.endsWith(".ts"))
        .map(f => join(rootDir, "src", f.name));
});

const readmeFile = join(rootDir, "README.md");
const template = join(rootDir, "README.template.md");

await copyFile(template, readmeFile)

const fileHandle = await open(readmeFile, O_APPEND)

try {

    for (const srcFile of srcFiles) {
        console.log("source file", srcFile);
        const buildResults = await build({
            entryPoints: [srcFile],
            bundle: true,
            minify: true,
            write: false
        });

        if (!buildResults.outputFiles || !buildResults.outputFiles.length) {
            console.warn(`no output files for ${srcFile}`);
            continue;
        }

        fileHandle.writeFile(`\n## ${ basename(srcFile)}\n\n`, {
            encoding: "utf-8"
        });

        for (const outputFile of buildResults.outputFiles) {
            const parts = ["```javascript\n",
            `javascript:${outputFile.text}`,
                "```\n"
            ];
            fileHandle.writeFile(parts.join(""), {encoding: "utf-8"});
        }

    }
} finally {
    fileHandle?.close();
}

// for await (const fileText of getFileContents(...srcFiles)) {
//     parts.push(fileText);
// }

// const outputText = parts.join("\n");

// // Update the README file
// await updateReadme(outputText);
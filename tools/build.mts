import {
  access,
  readdir,
  copyFile,
  open,
  writeFile,
  mkdir,
} from "node:fs/promises";
import { O_APPEND } from "node:constants";
import { dirname, join, basename } from "node:path";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

async function createDirectoryIfNecessary(outDir: string) {
  const outDirExists = await access(outDir).then(
    () => true,
    () => false
  );
  if (!outDirExists) {
    await mkdir(outDir);
  }
}

// Figure out where this script is running from
const __filename = fileURLToPath(import.meta.url);
console.debug("__filename", __filename);
const __directory = dirname(__filename);
console.debug("__directory", __directory);

// Get the project root directory.
const rootDir = join(__directory, "..");

// Get all of the *.ts files in src.
const srcFiles = await readdir(join(rootDir, "src"), {
  withFileTypes: true,
}).then((dirEnts) => {
  return dirEnts
    .filter((de) => de.isFile() && de.name.endsWith(".ts"))
    .map((f) => join(rootDir, "src", f.name));
});

// Copy the template to become the new README file, overwriting the old one
const readmeFile = join(rootDir, "README.md");
const template = join(rootDir, "README.template.md");
await copyFile(template, readmeFile);

// Open the readme file for appending.
const fileHandle = await open(readmeFile, O_APPEND);

// Create HTML document object.

const jsDom = new JSDOM("<!DOCTYPE html>");
const { document } = jsDom.window;

document.head.title = "GIS Bookmarklets";

const h1 = document.createElement("h1");
h1.textContent = "GIS Bookmarks";
document.body.append(h1);

const p = document.createElement("p");
p.textContent = "Drag links to your browser's bookmarks toolbar.";

document.body.append(p);

const frag = document.createDocumentFragment();

try {
  // Run esbuild for each of the source file.
  // There should only be one item in each buildResult's
  // outputFiles array.
  for (const srcFile of srcFiles) {
    console.log("source file", srcFile);
    // Build the TypeScript file into minified JavaScript.
    // Any functions, classes, etc., referenced from
    // external modules will be bundled into output.
    const buildResults = await build({
      entryPoints: [srcFile],
      bundle: true,
      minify: true,
      write: false,
    });

    // If there are no output files, write a warning and continue
    // to the next TypeScript file.
    if (!buildResults.outputFiles || !buildResults.outputFiles.length) {
      console.warn(`no output files for ${srcFile}`);
      continue;
    }

    const scriptName = basename(srcFile).replace(/\.\w+$/, "");

    // Write the results to the README.md file.
    fileHandle.writeFile(`\n## ${scriptName}\n\n`, {
      encoding: "utf-8",
    });

    for (const outputFile of buildResults.outputFiles) {
      const bookmarklet = `javascript:${outputFile.text}`;
      const parts = ["```javascript\n", bookmarklet, "```\n"];
      fileHandle.writeFile(parts.join(""), { encoding: "utf-8" });

      const li = document.createElement("li");
      const a = document.createElement("a");
      li.append(a);
      a.href = bookmarklet;
      a.text = scriptName;
      frag.append(li);
    }
  }

  const ul = document.createElement("ul");
  ul.append(frag);
  document.body.append(ul);

  const outDir = join(rootDir, "dist");
  const htmlFile = join(outDir, "index.html");
  try {
    // Create output directory if it doesn't already exist.
    await createDirectoryIfNecessary(outDir);
    await writeFile(htmlFile, jsDom.serialize(), {
      encoding: "utf8",
    });
  } catch (ex) {
    console.error(ex);
  }
} finally {
  fileHandle?.close();
}

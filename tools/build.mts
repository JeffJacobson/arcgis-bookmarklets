import {
  access,
  readdir,
  copyFile,
  open,
  writeFile,
  readFile,
  mkdir,
} from "node:fs/promises";
import { O_APPEND } from "node:constants";
import { dirname, join, relative } from "node:path";
import { cwd } from "node:process";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { JSDOM } from "jsdom";
import { marked } from "marked";
import GithubRepoUrl from "../src/modules/github/GithubRepoUrl.js";
import { createDocsMap, getBaseNameWithoutExt } from "./docTools.mjs";

/**
 * Creates the given directory if it does not already exist.
 * @param outDir - The directory to create if necessary.
 */
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
const __directory = dirname(__filename);

// Get the project root directory.
// Make it relative to the current working directory (cwd).
const rootDir = relative(join(__directory, ".."), cwd());

async function getPackageJson() {
  const pkgPath = join(rootDir, "package.json");
  const jsonText = await readFile(pkgPath).then((buffer) =>
    buffer.toString("utf8")
  );
  return JSON.parse(jsonText);
}

/**
 * Creates a paragraph containing a link containing a
 * badge image.
 * @param repoUrl - A GitHub repo URL.
 * @returns A <p> element.
 */
function createBadgeLink(repoUrl: GithubRepoUrl) {
  const badgeImg = document.createElement("img");
  badgeImg.src = repoUrl.ForksBadgeUrl.href;
  badgeImg.alt = "Badge showing number of forks";

  const sourceLink = document.createElement("a");
  sourceLink.href = repoUrl.href;
  sourceLink.append(badgeImg);

  const sourceP = document.createElement("p");
  sourceP.append(sourceLink);
  return sourceP;
}

async function addInitialHtmlContent(document: Document) {
  const title = document.createElement("title");
  title.text = "GIS Bookmarklets";
  document.head.append(title);

  const h1 = document.createElement("h1");
  h1.textContent = "GIS Bookmarks";
  document.body.append(h1);

  const p = document.createElement("p");
  p.textContent = "Drag links to your browser's bookmarks toolbar.";

  const packagejson = await getPackageJson();

  const repoUrl = new GithubRepoUrl(packagejson.repository.url);

  const sourceP = createBadgeLink(repoUrl);

  document.body.append(p, sourceP);
}

// Get all of the *.ts files in src.
const srcFiles = await readdir(join(rootDir, "src"), {
  withFileTypes: true,
}).then((dirEnts) => {
  return dirEnts
    .filter((de) => de.isFile() && de.name.endsWith(".ts"))
    .map((f) => join(rootDir, "src", f.name));
});

const docsMap = await createDocsMap(...srcFiles);

// Copy the template to become the new README file, overwriting the old one
const readmeFile = join(rootDir, "README.md");
const template = join(rootDir, "README.template.md");
await copyFile(template, readmeFile);

// Open the readme file for appending.
const fileHandle = await open(readmeFile, O_APPEND);

// Create HTML document object.
const jsDom = new JSDOM("<!DOCTYPE html>");
const { document } = jsDom.window;

await addInitialHtmlContent(document);

const frag = document.createDocumentFragment();

try {
  // Build the TypeScript file into minified JavaScript.
  // Any functions, classes, etc., referenced from
  // external modules will be bundled into output.
  const buildResults = await build({
    entryPoints: srcFiles,
    bundle: true,
    minify: true,
    write: false,
    outdir: join(rootDir, "dist"),
  });


  // If there are no output files, write a warning and continue
  // to the next TypeScript file.
  if (!buildResults.outputFiles || !buildResults.outputFiles.length) {
    throw new Error(`No outputfiles for ${srcFiles}`);
  }

  for (const outputFile of buildResults.outputFiles) {
    const scriptName = getBaseNameWithoutExt(outputFile.path);
    // Write the results to the README.md file.
    await fileHandle.writeFile(`\n## ${scriptName}\n\n`, {
      encoding: "utf-8",
    });
    const doc = docsMap.get(scriptName);

    if (doc) {
      // Write to README.md
      await fileHandle.writeFile(doc, {
        encoding: "utf-8",
      });
    }

    const bookmarklet = `javascript:${outputFile.text}`;
    const parts = ["```javascript\n", bookmarklet, "```\n"];
    await fileHandle.writeFile(parts.join(""), { encoding: "utf-8" });

    const h2 = document.createElement("h2");
    const a = document.createElement("a");
    h2.append(a);
    a.href = bookmarklet;
    a.text = scriptName;
    frag.append(h2);

    if (doc) {
      const parsed = marked.parse(doc);
      const div = document.createElement("div");
      div.innerHTML = parsed;
      frag.append(div);
    }
  }

  document.body.append(frag);

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

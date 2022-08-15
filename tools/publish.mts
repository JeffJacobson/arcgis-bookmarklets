/**
 * Publishes the contents of the "dist" folder
 * to GitHub pages (the gh-pages branch).
 */

import ghpages from "gh-pages";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Figure out where this script is running from
const __filename = fileURLToPath(import.meta.url);
console.debug("__filename", __filename);
const __directory = dirname(__filename);
console.debug("__directory", __directory);

// Get the project root directory.
const rootDir = join(__directory, "..");
const dirToPublish = join(rootDir, "dist");

console.log(`Publishing contents of ${dirToPublish} to the "gh-pages" branch.`);

ghpages.publish(dirToPublish, (err) => {
    console.error(err);
})
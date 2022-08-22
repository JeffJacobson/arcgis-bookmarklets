import { readFile } from "node:fs/promises";
import { basename } from "node:path";

export function getBaseNameWithoutExt(path: string) {
  return basename(path).replace(/\.\w+$/, "");
}

/**
 * An extension of Map where entries are keyed by base filename 
 * without extension.
 * Users can "get" entries with either full filename or with basename
 * without extension.
 */
export class DocToNameMap extends Map<string, string> {
    /**
     * @inheritdoc
     */
    constructor(entries?: readonly (readonly [string, string])[] | null)
    /**
     * @inheritdoc
     */
    constructor(entries?: Iterable<readonly [string, string]> | null) {
        super(entries)
    }
    /**
     * @inheritdoc
     */
    override get(key: string): string | undefined {
        return super.get(key) || super.get(getBaseNameWithoutExt(key));
    }
    /**
     * @inheritdoc
     */
    override set(key: string, value: string): this {
        return super.set(getBaseNameWithoutExt(key), value);
    }
}

/**
 * Reads the first TSDoc comment in a file, removing
 * all of the /** *\/ and leading *s in between on
 * each line.
 * @param sourceFile - The file to read from.
 * @returns The contents of the first TSDoc comment of the file,
 * or null if no such comment could be found.
 */
export async function readDocs(sourceFile: string) {
  const text = await readFile(sourceFile, {
    encoding: "utf8",
  });

  const re = /(?<=\/\*\*\r\n).+?(?=^\s\*\/)/ms;

  const match = text.match(re);

  if (!match) {
    return null;
  }

  return match[0].replace(/^\s\*\s/gm, "");
}

/**
 * Gets documentation for source files using {@link readDocs}.
 * @param sourceFiles - An array of source files.
 * @example
 * ```typescript
 * const docToPathMappings = await Promise.all([...getDocsForFiles("a.ts", "b.ts")])
 * const map = new Map(docToPathMappings);
 * ```
 */
export function* getDocsForFiles(...sourceFiles: string[]) {
  for (const sourceFile of sourceFiles) {
    yield readDocs(sourceFile).then(
      (d) => [getBaseNameWithoutExt(sourceFile), d] as [string, string | null]
    );
  }
}
/**
 * Creates a mapping of a document's description to its path.
 * @param sourceFiles - A collection of source file paths.
 * @returns - A Map object.
 */
export async function createDocsMap(...sourceFiles: string[]) {
  const map = new DocToNameMap();
  for await (const [path, doc] of getDocsForFiles(...sourceFiles)) {
    if (!doc) continue;
    const key = getBaseNameWithoutExt(path);
    map.set(key, doc);
  }
  return map;
}
 
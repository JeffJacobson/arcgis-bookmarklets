type ServiceUrlGroups = Record<string, string> & {
  /**
   * Name of the Map / Feature / etc. service.
   * Will have leading slash.
   */
  service: string;
  folder?: string;
  serviceType: string;
};

type LayerUrlGroups = ServiceUrlGroups & {
  /** A string containing an integer */
  layerId: string;
};

type SoeUrlGroups = ServiceUrlGroups & {
  extName: string;
  operation?: string;
};

interface ExtendedMatchArray<T extends Record<string, string>>
  extends RegExpMatchArray {
  groups: T;
}

export enum PageType {
  Unknown = 0,
  LayerQuery = 1,
  ExtensionOperation = 2,
}

/**
 * Constructs a RegExp that will match a URL or a partial URL by
 * joining the input parts, separating them with `"\\/"`.
 * @param parts The component parts of a RegExp that matches a URL.
 * Parts that have groups will be RegExp objects. Others will be strings.
 * @returns A regular expression that will match a URL.
 */
function buildUrlRegExp(...parts: Array<string | RegExp>): RegExp {
  return new RegExp(
    parts
      // Convert RegExps to their source property.
      .map((part) => (part instanceof RegExp ? part.source : part))
      // Join all parts with string `\/`
      .join(String.raw`\/`)
  );
}

const serviceUrlRe = buildUrlRegExp(
  "arcgis",
  "rest",
  "services",
  /(?<service>(?<folder>\/\w+)?\/(?<serviceName>\w+))/,
  /(?<serviceType>\w+Server)/
);

const serviceLayerUrlRe = buildUrlRegExp(serviceUrlRe, /(?<layerId>\d+)/);

/**
 * Matches a layer query URL.
 */
const layerQueryRe = buildUrlRegExp(serviceLayerUrlRe, "query");

const extensionUrlRe = buildUrlRegExp(
  serviceUrlRe,
  "exts",
  /(?<extName>[^/]+)/,
  /(?<operation>[^/]+)/
);

export class ArcGisUrl extends URL {
  public static getPageType(
    url: string | URL = location.href
  ): PageType {
    if (url instanceof URL) {
      url = url.href;
    }
    let match: RegExpMatchArray | null = null;
    match = url.match(
      layerQueryRe
    ) as ExtendedMatchArray<LayerUrlGroups> | null;
    if (match && match.groups) {
      return PageType.LayerQuery;
    }

    match = url.match(
      extensionUrlRe
    ) as ExtendedMatchArray<SoeUrlGroups> | null;
    if (match && match.groups) {
        return PageType.ExtensionOperation;
    }
    return PageType.Unknown;
  }
  public get PageType() {
    return ArcGisUrl.getPageType(this);
  }

  constructor(input: string, base?: string | URL) {
    super(input, base);
  }
}

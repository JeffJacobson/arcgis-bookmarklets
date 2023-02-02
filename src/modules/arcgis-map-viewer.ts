// Map Viewer:          https://wsdot.maps.arcgis.com/apps/mapviewer/index.html?url=http://data.wsdot.wa.gov/arcgis/rest/services/Shared/ExitNumbers/MapServer
// Map Viewer Classic:  https://wsdot.maps.arcgis.com/home/webmap/viewer.html?url=http%3A%2F%2Fdata.wsdot.wa.gov%2Farcgis%2Frest%2Fservices%2FShared%2FExitNumbers%2FMapServer&source=sd

import FormatError from "./FormatError.js";

export const modernViewerUrlRe =
  /^https:\/\/[\w.]+\/apps\/mapviewer\/index.html/i;
export const classicViewerUrlRe =
  /^https:\/\/[\w.]+\/home\/webmap\/viewer.html/i;

export type ClassicUrl = `https:${string}/home/webmap/viewer.html${
  | string
  | ""}`;
export type ModernUrl = `https:${string}/apps/mapviewer/index.html${
  | `?${string}`
  | ""}`;

export const currentUrl = new URL(location.href);

export const enum ViewerType {
  classic = "classic",
  modern = "modern",
}

export function isClassicUrl(url: string): url is ClassicUrl {
  return classicViewerUrlRe.test(url);
}

export function isModernUrl(url: string): url is ModernUrl {
  return modernViewerUrlRe.test(url);
}

export function getViewerType(url: string | URL): ViewerType {
  const urlToTest = url instanceof URL ? url.href : url;
  if (isModernUrl(urlToTest)) {
    return ViewerType.modern;
  } else if (isClassicUrl(urlToTest)) {
    return ViewerType.classic;
  }
  throw new FormatError(
    urlToTest,
    new RegExp(`((${classicViewerUrlRe.source})|(${modernViewerUrlRe.source}))`)
  );
}

/**
 * Extension of {@link URL} for ArcGIS Online map viewer URL.
 */
export class MapViewerUrl extends URL {
  public get viewerType() {
    return getViewerType(this);
  }

  declare href: ModernUrl | ClassicUrl;
  /**
   * @inheritdoc
   */
  constructor(...args: ConstructorParameters<typeof URL>) {
    super(...args);
  }
}

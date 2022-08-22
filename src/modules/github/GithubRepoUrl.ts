import FormatError from "../FormatError.js";

/**
 * The properties of a {@link GithubRepoUrl|Github repository URL}.
 */
export interface GithubRepoUrlProperties {
  url: URL;
  /** Name of user or org that owns the repository. */
  userOrOrg: string;
  /** Repository name */
  repo: string;
}

/**
 * An extension of the URL class for GitHub repository
 * URLs with additional properties and methods.
 */
export default class GithubRepoUrl extends URL {
  /**
   * Repository name
   */
  public readonly repo: string;
  /**
   * Name of user or org that owns the repository.
   */
  public readonly userOrOrg: string;
  /**
   * Regular expression matching a GitHub repository URL.
   */
  public static readonly re =
    /(?<url>https:\/\/github\.com\/(?<userOrOrg>[^/]+)\/(?<repo>[^/.]+))(?:\.git)?/i;

  /**
   * Parses a GitHub repository URL.
   * @param url A github repository URL
   * @returns A URL object.
   */
  public static parseGithubUrl(url: string | URL): GithubRepoUrlProperties {
    if (url instanceof URL) {
      url = url.href;
    }
    const match = url.match(GithubRepoUrl.re);
    if (!match || !match.groups) {
      throw new FormatError(url, GithubRepoUrl.re);
    }
    const { userOrOrg, repo } = match.groups;
    url = new URL(match.groups.url);
    return { url, userOrOrg, repo };
  }

  /**
   * Returns the GitHub Pages for this repository.
   * Note: This does not guarantee that GitHub Pages
   * has actually been set up for the repository.
   */
  public get GithubPagesUrl(): URL {
    return new URL(
      `https://${this.userOrOrg.toLowerCase()}.github.io/${this.repo}/`
    );
  }

  public get ForksBadgeUrl(): URL {
    return new URL(
      `github/forks/${this.userOrOrg}/${this.repo}?style=social`,
      "https://img.shields.io"
    );
  }

  /**
   * @inheritdoc
   */
  constructor(url: string | URL, base?: string | URL) {
    const props = GithubRepoUrl.parseGithubUrl(url);
    const { repo, userOrOrg } = props;
    super(props.url, base);
    this.repo = repo;
    this.userOrOrg = userOrOrg;
  }
}

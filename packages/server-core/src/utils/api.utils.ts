import { hypertubeLogger } from "@hypertube/libs";

export class ApiBase {
  protected readonly apiUrl: string;
  protected readonly defaultFetchOptions: RequestInit;

  constructor(apiUrl: string, defaultFetchOptions: RequestInit = {}) {
    this.apiUrl = apiUrl;
    this.defaultFetchOptions = defaultFetchOptions;
  }

  protected async fetch<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T | null> {
    try {
      const response = await fetch(this.apiUrl + url, {
        ...this.defaultFetchOptions,
        ...options,
      });
      return response.json() as Promise<T>;
    } catch {
      hypertubeLogger.error(`Error fetching ${url}`);
      return null;
    }
  }
}

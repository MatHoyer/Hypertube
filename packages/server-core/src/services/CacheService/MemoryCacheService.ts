import { ICacheService } from "./ICacheService.js";

export class MemoryCacheService implements ICacheService {
  memoryCache: Record<string, string>;

  constructor() {
    this.memoryCache = {};
  }

  set: ICacheService["set"] = (key, value, seconds) => {
    this.memoryCache[key] = value.toString();
    setTimeout(() => {
      delete this.memoryCache[key];
    }, seconds * 1000);
  };

  get: ICacheService["get"] = (key) => {
    return new Promise((resolve) => {
      resolve(this.memoryCache[key]);
    });
  };

  has: ICacheService["has"] = async (key) => !!(await this.get(key));
}

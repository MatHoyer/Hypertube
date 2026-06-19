export interface ICacheService {
  set: (key: string, value: string | number, seconds: number) => void;
  get: (key: string) => Promise<string | null>;
  has: (key: string) => Promise<boolean>;
}

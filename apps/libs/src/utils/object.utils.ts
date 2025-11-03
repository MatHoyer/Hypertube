export const groupBy = <T extends Record<string, any>, K extends keyof T>(
  array: T[],
  key: K
): Record<T[K] & PropertyKey, T[] | undefined> => {
  return array.reduce((groups, item) => {
    const group = item[key] as T[K] & PropertyKey;
    if (!groups[group]) groups[group] = [];
    groups[group].push(item);
    return groups;
  }, {} as Record<T[K] & PropertyKey, T[] | undefined>);
};

export const pick = <T extends Record<string, any>, K extends keyof T>(
  object: T,
  keysToPick: K[]
): Pick<T, K> => {
  return keysToPick.reduce(
    (keys, key) => ({ ...keys, [key]: object[key] }),
    {} as Pick<T, K>
  );
};

export const typedKeys = <T extends object>(obj: T) => {
  return Object.keys(obj) as Array<keyof T>;
};

export const typedValues = <T extends object>(obj: T) => {
  return Object.values(obj) as Array<T[keyof T]>;
};

export const typedEntries = <T extends object>(obj: T) => {
  return Object.entries(obj) as Array<[keyof T, T[keyof T]]>;
};

export const isPurObject = (
  obj: unknown
): obj is Record<string | number | symbol, unknown> => {
  return typeof obj === "object" && obj !== null && !Array.isArray(obj);
};

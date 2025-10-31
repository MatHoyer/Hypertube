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

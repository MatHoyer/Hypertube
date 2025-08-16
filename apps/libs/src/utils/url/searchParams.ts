export const convertObjectToSearchParams = <T extends Record<string, any>>(
  obj: T
) => {
  const searchParams = Object.fromEntries(
    Object.entries(obj)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => [key, "" + value])
  );

  return new URLSearchParams(searchParams);
};

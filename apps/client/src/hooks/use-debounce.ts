import { useEffect, useState } from "react";

const useDebounce = <T>(value: T, timeMs: number) => {
  const [bounce, setBounce] = useState<T>();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setBounce(value);
    }, timeMs);

    return () => clearTimeout(timeout);
  }, [setBounce, value, timeMs]);

  return bounce;
};

export default useDebounce;

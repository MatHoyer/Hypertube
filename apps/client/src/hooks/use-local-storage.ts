import type { TLocalStorageKeys } from "@/lib/const";
import type { Dispatch } from "react";
import { useEffect, useState } from "react";

const storageEvents = new EventTarget();

export function useLocalStorage<T>(
  key: TLocalStorageKeys,
  initialValue: T
): [T, Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
      storageEvents.dispatchEvent(
        new CustomEvent<{ newValue: T }>(`${key} changed`, {
          detail: { newValue: storedValue },
        })
      );
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key) {
        try {
          const newValue = event.newValue
            ? (JSON.parse(event.newValue) as T)
            : initialValue;
          setStoredValue(newValue);
        } catch (error) {
          console.warn(
            `Error parsing localStorage key "${key}" on storage event:`,
            error
          );
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);

    const handleCustomStorageChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ newValue: T }>;
      setStoredValue(customEvent.detail.newValue);
    };
    storageEvents.addEventListener(`${key} changed`, handleCustomStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      storageEvents.removeEventListener(
        `${key} changed`,
        handleCustomStorageChange
      );
    };
  }, [key, initialValue]);

  return [storedValue, setStoredValue];
}

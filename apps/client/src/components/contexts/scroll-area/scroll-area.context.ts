import { createContext, useContext } from "react";
import type { ScrollAreaContextType } from "./scroll-area.type";

export const ScrollAreaContext = createContext<
  ScrollAreaContextType | undefined
>(undefined);

export const useScrollArea = () => {
  const ctx = useContext(ScrollAreaContext);
  if (!ctx) {
    throw new Error("useScrollArea must be used within a ScrollAreaProvider");
  }
  return ctx;
};

import type { TResolutionSchema } from "@hypertube/libs";
import { createContext, useContext } from "react";

type ResolutionsContextType = {
  resolutions: TResolutionSchema[];
  streamableResolutions: TResolutionSchema[];
  isLoading: boolean;
  isError: boolean;
};

export const ResolutionsContext = createContext<
  ResolutionsContextType | undefined
>(undefined);

export const useResolutions = () => {
  const ctx = useContext(ResolutionsContext);
  if (!ctx) {
    throw new Error("useResolutions must be used within a ResolutionsProvider");
  }
  return ctx;
};

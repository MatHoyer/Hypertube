export type ScrollToOptions = {
  behavior?: "smooth" | "instant";
  top?: number;
};

export type ScrollAreaContextType = {
  scrollTo: (options: ScrollToOptions) => void;
};

import { ScrollAreaContext } from "./scroll-area.context";

export const ScrollAreaProvider: React.FC<{
  children: React.ReactNode;
  scrollTo: (options: ScrollToOptions) => void;
}> = ({ children, scrollTo }) => {
  return (
    <ScrollAreaContext.Provider
      value={{
        scrollTo,
      }}
    >
      {children}
    </ScrollAreaContext.Provider>
  );
};

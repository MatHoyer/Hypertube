import { WINDOW_MIN_WIDTH } from "@/lib/const";
import * as React from "react";

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${WINDOW_MIN_WIDTH.MD - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < WINDOW_MIN_WIDTH.MD);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < WINDOW_MIN_WIDTH.MD);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}

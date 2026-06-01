import { WINDOW_MIN_WIDTH } from "@/lib/const";
import { useEffect, useState } from "react";

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(
    window.innerWidth < WINDOW_MIN_WIDTH.MD
  );

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${WINDOW_MIN_WIDTH.MD - 1}px)`);
    const onChange = () => setIsMobile(window.innerWidth < WINDOW_MIN_WIDTH.MD);

    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}

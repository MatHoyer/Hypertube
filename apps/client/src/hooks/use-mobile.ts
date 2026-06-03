import { WINDOW_MIN_WIDTH } from "@/lib/const";
import { useEffect, useState } from "react";

interface UseIsMobileReturn {
  isMobile: boolean;
  isLoading: boolean;
}

export const useIsMobile = (): UseIsMobileReturn => {
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      `(max-width: ${WINDOW_MIN_WIDTH.MD}px)`
    );

    const checkIsMobile = () => {
      // Check using user agent (additional detection)
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = [
        "android",
        "webos",
        "iphone",
        "ipad",
        "ipod",
        "blackberry",
        "windows phone",
        "mobile",
      ];

      const isMobileUA = mobileKeywords.some((keyword) =>
        userAgent.includes(keyword)
      );

      // Combine both checks - prioritize media query but consider user agent
      const isMobileDevice =
        mediaQuery.matches ||
        (isMobileUA && window.innerWidth <= WINDOW_MIN_WIDTH.MD);

      setIsMobile(isMobileDevice);
      setIsLoading(false);
    };

    // Initial check
    checkIsMobile();

    // Listen for media query changes
    const handleChange = () => checkIsMobile();

    mediaQuery.addEventListener("change", handleChange);

    // Listen for window resize
    window.addEventListener("resize", checkIsMobile);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  return {
    isMobile,
    isLoading,
  };
};

export default useIsMobile;

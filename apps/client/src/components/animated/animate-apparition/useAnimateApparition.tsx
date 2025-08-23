import { useRef, useState } from "react";

const useAnimateApparition = (initialState = false) => {
  const [isAnimating, setIsAnimating] = useState(initialState);

  const animate = () => {
    setIsAnimating((prev) => !prev);
  };

  return { isAnimating, animate };
};

const useAnimateApparitionAndDisparition = (initialState = false) => {
  const [isAnimating, setIsAnimating] = useState(initialState);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const animate = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
    }, 1000);
  };

  return { isAnimating, animate };
};

export { useAnimateApparition, useAnimateApparitionAndDisparition };

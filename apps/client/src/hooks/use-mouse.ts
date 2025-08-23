import { useEffect, useRef, useState } from "react";

export const useMouse = (
  containerRef: React.RefObject<HTMLElement | null>,
  timeoutDuration = 1000
) => {
  const [mouseMoving, setMouseMoving] = useState(false);
  const [mouseClicked, setMouseClicked] = useState(false);
  const moveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseMove = () => {
    setMouseMoving(true);
    if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current);
    moveTimeoutRef.current = setTimeout(() => {
      setMouseMoving(false);
    }, timeoutDuration);
  };
  const handleMouseClick = () => {
    setMouseClicked(true);
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = setTimeout(() => {
      setMouseClicked(false);
    }, timeoutDuration);
  };

  useEffect(() => {
    if (!containerRef?.current) return;
    const container = containerRef.current;

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("click", handleMouseClick);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("click", handleMouseClick);
      if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current);
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    };
  }, [containerRef]);

  return {
    mouseMoving,
    mouseClicked,
    triggerMouseMove: handleMouseMove,
  };
};

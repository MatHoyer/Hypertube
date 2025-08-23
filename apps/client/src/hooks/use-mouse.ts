import { useEffect, useState } from "react";
import { useTimeoutResetState } from "./use-timeout-state-reset";

export const useMouse = (
  containerRef: React.RefObject<HTMLElement | null>,
  timeoutDuration = 1000
) => {
  const { value: mouseMoving, setValue: setMouseMoving } = useTimeoutResetState(
    false,
    timeoutDuration
  );
  const { value: mouseClicked, setValue: setMouseClicked } =
    useTimeoutResetState(false, timeoutDuration);
  const [mouseIn, setMouseIn] = useState(false);

  const handleMouseMove = () => {
    setMouseMoving(true);
  };
  const handleMouseClick = () => {
    setMouseClicked(true);
  };

  useEffect(() => {
    if (!containerRef?.current) return;
    const container = containerRef.current;

    const handleMouseEnter = () => {
      setMouseIn(true);
    };
    const handleMouseLeave = () => {
      setMouseIn(false);
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("click", handleMouseClick);
    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("click", handleMouseClick);
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [containerRef]);

  return {
    mouseMoving,
    mouseClicked,
    mouseIn,
    triggerMouseMove: handleMouseMove,
    triggerMouseClick: handleMouseClick,
  };
};

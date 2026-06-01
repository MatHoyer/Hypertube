import { useCallback, useEffect, useState } from "react";
import { useTimeoutResetState } from "./use-timeout-state-reset";

export const useMouse = (
  containerRef: React.RefObject<HTMLElement | null>,
  timeoutDuration = 1000
) => {
  const [currentContainer, setCurrentContainer] = useState<HTMLElement | null>(
    null
  );

  const { value: mouseMoving, setValue: setMouseMoving } = useTimeoutResetState(
    false,
    timeoutDuration
  );
  const { value: mouseClicked, setValue: setMouseClicked } =
    useTimeoutResetState(false, timeoutDuration);
  const [mouseIn, setMouseIn] = useState(false);

  const handleMouseMove = useCallback(() => {
    setMouseMoving(true);
  }, [setMouseMoving]);

  const handleMouseClick = useCallback(() => {
    setMouseClicked(true);
  }, [setMouseClicked]);

  useEffect(() => {
    if (!containerRef) return;

    setCurrentContainer(containerRef.current);
  }, [containerRef]);

  useEffect(() => {
    if (!currentContainer) return;

    const handleMouseEnter = () => setMouseIn(true);
    const handleMouseLeave = () => setMouseIn(false);

    currentContainer.addEventListener("mousemove", handleMouseMove);
    currentContainer.addEventListener("click", handleMouseClick);
    currentContainer.addEventListener("mouseenter", handleMouseEnter);
    currentContainer.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      currentContainer.removeEventListener("mousemove", handleMouseMove);
      currentContainer.removeEventListener("click", handleMouseClick);
      currentContainer.removeEventListener("mouseenter", handleMouseEnter);
      currentContainer.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [currentContainer, handleMouseMove, handleMouseClick]);

  return {
    mouseMoving,
    mouseClicked,
    mouseIn,
    triggerMouseMove: handleMouseMove,
    triggerMouseClick: handleMouseClick,
  };
};

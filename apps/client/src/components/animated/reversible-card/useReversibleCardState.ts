import { useState } from "react";

const useReversibleCardState = (initialState = false) => {
  const [state, setState] = useState(initialState);
  const [isAnimating, setIsAnimating] = useState(false);

  const flip = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setState((prev) => !prev);
  };

  const manualFlip = (state: boolean) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setState(state);
  };

  return {
    isFlipped: state,
    flip,
    isAnimating,
    setIsAnimating,
    manualFlip,
  };
};

export default useReversibleCardState;

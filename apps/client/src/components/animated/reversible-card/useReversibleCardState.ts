import { useState } from "react";

const useReversibleCardState = (initialState = false) => {
  const [state, setState] = useState(initialState);
  const [isAnimating, setIsAnimating] = useState(false);

  const flip = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setState((prev) => !prev);
  };

  return { isFlipped: state, flip, isAnimating, setIsAnimating };
};

export default useReversibleCardState;

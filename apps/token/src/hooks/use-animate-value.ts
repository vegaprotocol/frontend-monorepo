import React from "react";

import { Colors } from "../config";
import { BigNumber } from "../lib/bignumber";
import { usePrevious } from "./use-previous";

const FLASH_DURATION = 1200; // Duration of flash animation in milliseconds

export function useAnimateValue(
  elRef: React.MutableRefObject<HTMLElement | null>,
  value?: BigNumber | null
) {
  const shouldAnimate = React.useRef(false);
  const previous = usePrevious(value);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      shouldAnimate.current = true;
    }, 800);
    return () => clearTimeout(timeout);
  }, []);

  if (
    shouldAnimate.current &&
    value &&
    previous &&
    !value.isEqualTo(previous) &&
    value.isLessThan(previous)
  ) {
    elRef.current?.animate(
      [
        { backgroundColor: Colors.VEGA_RED, color: Colors.WHITE },
        { backgroundColor: Colors.VEGA_RED, color: Colors.WHITE, offset: 0.8 },
        { backgroundColor: Colors.GRAY_LIGHT, color: Colors.WHITE },
      ],
      FLASH_DURATION
    );
  } else if (
    shouldAnimate.current &&
    value &&
    previous &&
    !value.isEqualTo(previous) &&
    value.isGreaterThan(previous)
  ) {
    elRef.current?.animate(
      [
        { backgroundColor: Colors.VEGA_GREEN, color: Colors.WHITE },
        {
          backgroundColor: Colors.VEGA_GREEN,
          color: Colors.WHITE,
          offset: 0.8,
        },
        { backgroundColor: Colors.GRAY_LIGHT, color: Colors.WHITE },
      ],
      FLASH_DURATION
    );
  }
}

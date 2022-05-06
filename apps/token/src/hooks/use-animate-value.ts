import React from 'react';
import { usePrevious } from './use-previous';
import type { BigNumber } from '../lib/bignumber';
import { theme } from '@vegaprotocol/tailwindcss-config';
const Colors = theme.colors;

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
        { backgroundColor: Colors.red.vega, color: Colors.white.DEFAULT },
        {
          backgroundColor: Colors.red.vega,
          color: Colors.white.DEFAULT,
          offset: 0.8,
        },
        {
          backgroundColor: Colors.gray.light,
          color: Colors.white.DEFAULT,
        },
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
        {
          backgroundColor: Colors.green.vega,
          color: Colors.white.DEFAULT,
        },
        {
          backgroundColor: Colors.green.vega,
          color: Colors.white.DEFAULT,
          offset: 0.8,
        },
        {
          backgroundColor: Colors.gray.light,
          color: Colors.white.DEFAULT,
        },
      ],
      FLASH_DURATION
    );
  }
}

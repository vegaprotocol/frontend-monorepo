import React from 'react';
import { usePrevious } from './use-previous';
import type { BigNumber } from '../lib/bignumber';
import { theme as tailwindcss } from '@vegaprotocol/tailwindcss-config';
import { useThemeSwitcher } from '@vegaprotocol/react-helpers';
const Colors = tailwindcss.colors;

const FLASH_DURATION = 1200; // Duration of flash animation in milliseconds

export function useAnimateValue(
  elRef: React.MutableRefObject<HTMLElement | null>,
  value?: BigNumber | null
) {
  const shouldAnimate = React.useRef(false);
  const previous = usePrevious(value);
  const [theme] = useThemeSwitcher();

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
        { backgroundColor: Colors.vega.red, color: Colors.white.DEFAULT },
        {
          backgroundColor: Colors.vega.red,
          color: Colors.white.DEFAULT,
          offset: 0.8,
        },
        {
          backgroundColor:
            theme === 'dark' ? Colors.white[60] : Colors.black[60],
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
          backgroundColor: Colors.vega.green,
          color: Colors.white.DEFAULT,
        },
        {
          backgroundColor: Colors.vega.green,
          color: Colors.white.DEFAULT,
          offset: 0.8,
        },
        {
          backgroundColor:
            theme === 'dark' ? Colors.white[60] : Colors.black[60],
          color: Colors.white.DEFAULT,
        },
      ],
      FLASH_DURATION
    );
  }
}

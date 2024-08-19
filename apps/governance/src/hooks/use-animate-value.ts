import React from 'react';
import type { BigNumber } from '../lib/bignumber';
import { theme } from '@vegaprotocol/tailwindcss-config';
import colors from 'tailwindcss/colors';
import { usePrevious } from '@vegaprotocol/react-helpers';
const customColors = theme.colors;

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
        {
          backgroundColor: customColors.pink.DEFAULT,
          color: colors.white,
        },
        {
          backgroundColor: customColors.pink.DEFAULT,
          color: colors.white,
          offset: 0.8,
        },
        {
          backgroundColor: colors.neutral[500],
          color: colors.white,
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
          backgroundColor: customColors.green.DEFAULT,
          color: colors.white,
        },
        {
          backgroundColor: customColors.green.DEFAULT,
          color: colors.white,
          offset: 0.8,
        },
        {
          backgroundColor: colors.neutral[500],
          color: colors.white,
        },
      ],
      FLASH_DURATION
    );
  }
}

/**
 * A component that will display a number, and when it is updated will use animation to
 * highlight the direction of change. This defaults to red for downwards, and green for
 * upwards.
 *
 * @author Matt <matt@vega.xyz>
 * @author Edd <edd@vega.xyz>
 * @author John <john.walley@mulberryhousesoftware.com>
 */

import { memo, useRef, useEffect } from 'react';
import { theme } from '@vegaprotocol/tailwindcss-config';
import { splitAt } from '@vegaprotocol/utils';

const FLASH_DURATION = 800; // Duration of flash animation in milliseconds

export interface FlashCellProps {
  /**
   * The string representation of value. It can be formatted in bespoke ways,
   * so we can't simply convert value
   */
  children: string;
  /** The numeric representation of 'children' */
  value: number;
}

/**
 * Given two strings, finds the index first character that has changed in string 2
 *
 * Used by <FlashCell /> to highlight substrings to highlight the portion of a number that has changed
 * From: https://stackoverflow.com/questions/32858626/detect-position-of-first-difference-in-2-strings
 *
 * @param a String to diff
 * @param b Second string to diff
 * @return number Index of first different character, or -1
 */
export function findFirstDiffPos(a: string, b: string): number {
  let i = 0;
  if (a === b) return -1;
  if (!a || !b) return -1;

  while (a[i] === b[i]) i++;
  return i;
}

/**
 * Get value from previous render
 */
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

export const FlashCell = memo(({ children, value }: FlashCellProps) => {
  const ref = useRef<HTMLSpanElement | null>(null);
  const previousLabel = usePrevious(children);
  const previousValue = usePrevious(value);

  const indexOfChange = previousLabel
    ? findFirstDiffPos(previousLabel, children)
    : 0;

  const splitText = splitAt(indexOfChange)(children);

  if (indexOfChange !== -1 && previousValue !== undefined) {
    if (value < previousValue) {
      ref.current?.animate(
        [
          { color: theme.colors.market.red.DEFAULT },
          { color: theme.colors.market.red.DEFAULT, offset: 0.8 },
          { color: 'inherit' },
        ],
        FLASH_DURATION
      );
    } else if (value > previousValue) {
      ref.current?.animate(
        [
          { color: theme.colors.market.green.DEFAULT },
          { color: theme.colors.market.green.DEFAULT, offset: 0.8 },
          { color: 'inherit' },
        ],
        FLASH_DURATION
      );
    }
  }

  return (
    <span data-testid="flash-cell">
      {splitText[0]}
      <span ref={ref}>{splitText[1]}</span>
    </span>
  );
});

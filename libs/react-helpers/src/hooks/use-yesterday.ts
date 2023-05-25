import { useEffect, useRef } from 'react';

const MINUTE = 60 * 1000;
const DAY = 24 * 60 * 60 * 1000;

export const now = (roundBy = 1) => {
  return Math.floor((Math.round(Date.now() / 1000) * 1000) / roundBy) * roundBy;
};

export const createAgo =
  (ago: number) =>
  (roundBy = 5 * MINUTE) => {
    const timestamp = useRef<number>(now(roundBy) - ago);
    useEffect(() => {
      const i = setInterval(() => {
        timestamp.current = now(roundBy) - ago;
      }, roundBy);
      return () => clearInterval(i);
    }, [roundBy]);
    return timestamp.current;
  };

/**
 * Returns the yesterday's timestamp rounded by given number (in milliseconds; 5 minutes by default)
 */
export const useYesterday = createAgo(DAY);
/**
 * Returns the five days ago timestamp rounded by given number (in milliseconds; 5 minutes by default)
 */
export const useFiveDaysAgo = createAgo(5 * DAY);

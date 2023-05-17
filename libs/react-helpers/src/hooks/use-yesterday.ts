import { useEffect, useRef } from 'react';

const DEFAULT_ROUND_BY_MS = 5 * 60 * 1000;
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export const now = (roundBy = 1) => {
  return Math.floor((Math.round(Date.now() / 1000) * 1000) / roundBy) * roundBy;
};

/**
 * Returns the yesterday's timestamp rounded by given number (in milliseconds; 5 minutes by default)
 */
export const useYesterday = (roundBy = DEFAULT_ROUND_BY_MS) => {
  const yesterday = useRef<number>(now(roundBy) - TWENTY_FOUR_HOURS_MS);
  useEffect(() => {
    const i = setInterval(() => {
      yesterday.current = now(roundBy) - TWENTY_FOUR_HOURS_MS;
    }, roundBy);
    return () => clearInterval(i);
  }, [roundBy]);
  return yesterday.current;
};

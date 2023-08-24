import { useEffect, useState } from 'react';
import { useBlockStatisticsQuery } from './__generated__/BlockStatistics';
import sum from 'lodash/sum';
import { isTestEnv } from '@vegaprotocol/utils';

const DEFAULT_POLLS = 10;
const INTERVAL = 1000;
const durations = [] as number[];

/**
 * Parses block duration value and output a number of milliseconds.
 * @param input The block duration input from the API, e.g. 4m5.001s
 * @returns A number of milliseconds
 */
export const parseDuration = (input: string) => {
  // h  -> 60*60*1000
  // m  -> 60*1000
  // s  -> 1000
  // ms -> 1
  // µs -> 1/1000
  // ns -> 1/1000000
  let H = 0;
  let M = 0;
  let S = 0;
  const lessThanSecond = /^[0-9.]+[nµm]*s$/gu.test(input);
  const exp = /(?<hours>[0-9.]+h)?(?<minutes>[0-9.]+m)?(?<seconds>[0-9.]+s)?/gu;
  const m = exp.exec(input);
  const seconds = lessThanSecond ? input : m?.groups?.['seconds'];
  if (seconds) {
    S = parseFloat(seconds);
    if (seconds.includes('ns')) S /= 1000 * 1000;
    else if (seconds.includes('µs')) S /= 1000;
    else if (seconds.includes('ms')) S *= 1;
    else if (seconds.includes('s')) S *= 1000;
  }
  const minutes = m?.groups?.['minutes'];
  if (minutes && !lessThanSecond) {
    M = parseFloat(minutes) * 60 * 1000;
  }
  const hours = m?.groups?.['hours'];
  if (hours && !lessThanSecond) {
    H = parseFloat(hours) * 60 * 60 * 1000;
  }
  return H + M + S;
};

const useAverageBlockDuration = (polls = DEFAULT_POLLS) => {
  const [avg, setAvg] = useState<number | undefined>(undefined);
  const { data, startPolling, stopPolling, error } = useBlockStatisticsQuery({
    fetchPolicy: 'network-only',
    errorPolicy: 'ignore',
    skip: durations.length === polls,
  });

  useEffect(() => {
    if (error) {
      stopPolling();
      return;
    }

    if (!isTestEnv() && window.location.hostname !== 'localhost') {
      startPolling(INTERVAL);
    }
  }, [error, startPolling, stopPolling]);

  useEffect(() => {
    if (durations.length < polls && data) {
      durations.push(parseDuration(data.statistics.blockDuration)); // ms
    }
    if (durations.length === polls) {
      const averageBlockDuration = sum(durations) / durations.length; // ms
      setAvg(averageBlockDuration);
    }
  }, [data, polls]);

  return avg;
};

export const useTimeToUpgrade = (
  upgradeBlockHeight?: number,
  polls = DEFAULT_POLLS
) => {
  const [time, setTime] = useState<number | undefined>(undefined);
  const avg = useAverageBlockDuration(polls);
  const { data } = useBlockStatisticsQuery({
    fetchPolicy: 'network-only',
    errorPolicy: 'ignore',
  });

  useEffect(() => {
    const t =
      (Number(upgradeBlockHeight) - Number(data?.statistics.blockHeight)) *
      Number(avg);
    if (!isNaN(t)) {
      setTime(t);
    }
  }, [avg, data?.statistics.blockHeight, upgradeBlockHeight]);

  useEffect(() => {
    const i = setInterval(() => {
      if (time !== undefined) {
        setTime(time - 1000);
      }
    }, 1000);
    return () => {
      clearInterval(i);
    };
  }, [time]);

  return time;
};

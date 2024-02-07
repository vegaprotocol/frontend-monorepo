import { isValidUrl } from '@vegaprotocol/utils';
import { useEffect, useState } from 'react';

export const useResponseTime = (url: string, trigger?: unknown) => {
  const [responseTime, setResponseTime] = useState<number>();
  useEffect(() => {
    if (!canMeasureResponseTime(url)) return;
    const duration = measureResponseTime(url);
    setResponseTime(duration);
  }, [url, trigger]);
  return { responseTime };
};

export const canMeasureResponseTime = (url: string) => {
  if (!isValidUrl(url)) return false;
  if (typeof window.performance.getEntriesByName !== 'function') return false;
  return true;
};

export const measureResponseTime = (url: string) => {
  const requestUrl = new URL(url);
  const requests = window.performance.getEntriesByName(requestUrl.href);
  const { duration } = (requests.length && requests[requests.length - 1]) || {};
  return duration;
};

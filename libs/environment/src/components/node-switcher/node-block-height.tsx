import { useEffect } from 'react';
import { useStatisticsQuery } from '../../utils/__generated__/Statistics';

type NodeBlockHeightProps = {
  value?: number;
  setValue: (value: number) => void;
};

const POLL_INTERVAL = 3000;

export const NodeBlockHeight = ({ value, setValue }: NodeBlockHeightProps) => {
  const { data, startPolling, stopPolling } = useStatisticsQuery({
    pollInterval: POLL_INTERVAL,
  });

  useEffect(() => {
    const handleStartPoll = () => startPolling(POLL_INTERVAL);
    const handleStopPoll = () => stopPolling();
    window.addEventListener('blur', handleStopPoll);
    window.addEventListener('focus', handleStartPoll);
    return () => {
      window.removeEventListener('blur', handleStopPoll);
      window.removeEventListener('focus', handleStartPoll);
    };
  }, [startPolling, stopPolling]);

  useEffect(() => {
    if (data?.statistics?.blockHeight) {
      setValue(Number(data.statistics.blockHeight));
    }
  }, [setValue, data?.statistics?.blockHeight]);

  return <span>{value ?? '-'}</span>;
};

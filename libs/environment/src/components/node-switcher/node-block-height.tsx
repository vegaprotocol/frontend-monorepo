import { useEffect } from 'react';
import { gql, useQuery } from '@apollo/client';

type NodeBlockHeightProps = {
  value?: number;
  setValue: (value: number) => void;
};

const POLL_INTERVAL = 3000;

const BLOCK_HEIGHT_QUERY = gql`
  query {
    statistics {
      blockHeight
    }
  }
`;

export const NodeBlockHeight = ({ value, setValue }: NodeBlockHeightProps) => {
  const { data, startPolling, stopPolling } = useQuery(BLOCK_HEIGHT_QUERY, {
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
      setValue(data.statistics.blockHeight);
    }
  }, [setValue, data?.statistics?.blockHeight]);

  return <span>{value ?? '-'}</span>;
};

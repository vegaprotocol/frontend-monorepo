import { useState, useEffect } from 'react';
import { useTendermintWebsocket } from '../../hooks/use-tendermint-websocket';
import { t } from '@vegaprotocol/react-helpers';
import { ButtonLink } from '@vegaprotocol/ui-toolkit';

interface BlocksRefetchProps {
  refetch: () => void;
}

export const BlocksRefetch = ({ refetch }: BlocksRefetchProps) => {
  const [blocksToLoad, setBlocksToLoad] = useState<number>(0);

  const { messages } = useTendermintWebsocket({
    query: "tm.event = 'NewBlock'",
  });

  useEffect(() => {
    if (messages.length > 0) {
      setBlocksToLoad((prev) => prev + 1);
    }
  }, [messages]);

  const refresh = () => {
    refetch();
    setBlocksToLoad(0);
  };

  return (
    <div className="mb-28">
      <span data-testid="new-blocks">{blocksToLoad} new blocks - </span>
      <ButtonLink onClick={refresh} data-testid="refresh">
        {t('refresh to see latest')}
      </ButtonLink>
    </div>
  );
};

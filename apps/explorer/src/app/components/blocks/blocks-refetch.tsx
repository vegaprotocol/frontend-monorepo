import { useState, useEffect } from 'react';
import { useTendermintWebsocket } from '../../hooks/use-tendermint-websocket';
import { t } from '@vegaprotocol/react-helpers';
import { Button } from '@vegaprotocol/ui-toolkit';

interface BlocksRefetchProps {
  refetch: () => void;
}

export const BlocksRefetch = ({ refetch }: BlocksRefetchProps) => {
  const [blocksToLoad, setBlocksToLoad] = useState<number>(0);

  const { messages } = useTendermintWebsocket({
    query: "tm.event = 'NewBlock'",
  });

  console.log(
    `blocks refetch ws message received: ${messages[messages.length - 1]}`
  );

  useEffect(() => {
    console.log(`messages now of length: ${messages.length}`);

    if (messages.length > 0) {
      setBlocksToLoad((prev) => prev + 1);
    }
  }, [messages]);

  const refresh = () => {
    refetch();
    setBlocksToLoad(0);
  };

  return (
    <>
      <span data-testid="new-blocks">{blocksToLoad} new blocks -</span>

      <Button
        onClick={refresh}
        variant="inline-link"
        className="mb-28"
        data-testid="refresh"
      >
        {t('refresh to see latest')}
      </Button>
    </>
  );
};

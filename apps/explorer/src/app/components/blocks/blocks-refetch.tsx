import { useTendermintWebsocket } from '../../hooks/use-tendermint-websocket';
import { t } from '@vegaprotocol/react-helpers';
import { Button } from '@vegaprotocol/ui-toolkit';

interface BlocksRefetchProps {
  refetch: () => void;
}

export const BlocksRefetch = ({ refetch }: BlocksRefetchProps) => {
  const { messages: newBlocks } = useTendermintWebsocket({
    query: "tm.event = 'NewBlock'",
  });

  return (
    <>
      <span>{newBlocks.length} new blocks</span>

      <Button
        onClick={() => refetch()}
        variant="inline-link"
        className="mb-28"
        data-testid="refresh"
      >
        {t('Refresh to see latest')}
      </Button>
    </>
  );
};

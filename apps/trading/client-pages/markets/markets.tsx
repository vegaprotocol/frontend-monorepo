import { MarketsContainer } from '@vegaprotocol/markets';
import { useMarketClickHandler } from '../../lib/hooks/use-market-click-handler';
import { SuccessorMarketRenderer } from './successor-market-cell';

export const Markets = () => {
  const handleOnSelect = useMarketClickHandler();
  return (
    <MarketsContainer
      onSelect={handleOnSelect}
      SuccessorMarketRenderer={SuccessorMarketRenderer}
    />
  );
};

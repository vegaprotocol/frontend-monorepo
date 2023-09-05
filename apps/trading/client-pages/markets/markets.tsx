import { MarketsContainer } from '@vegaprotocol/markets';
import { useMarketClickHandler } from '../../lib/hooks/use-market-click-handler';

export const Markets = () => {
  const handleOnSelect = useMarketClickHandler();
  return <MarketsContainer onSelect={handleOnSelect} />;
};

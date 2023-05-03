import { MarketsContainer } from '@vegaprotocol/market-list';
import { useMarketClickHandler } from '../../lib/hooks/use-market-click-handler';
import { MarketTableActions } from '../../components/market-table-actions';

export const Markets = () => {
  const handleOnSelect = useMarketClickHandler();
  return (
    <MarketsContainer onSelect={handleOnSelect} actions={MarketTableActions} />
  );
};

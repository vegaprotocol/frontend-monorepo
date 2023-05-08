import { useMarketList } from '@vegaprotocol/market-list';
import {
  MarketStateMapping,
  MarketTradingModeMapping,
} from '@vegaprotocol/types';
import { TinyScroll } from '@vegaprotocol/ui-toolkit';
import { Link } from 'react-router-dom';

export const MarketSelector = () => {
  const { data, loading, error } = useMarketList();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  return (
    <TinyScroll className="h-full overflow-y-auto">
      <ul className="h-full">
        {data?.map((market) => {
          return (
            <li key={market.id}>
              <Link
                to={`/markets/${market.id}`}
                className="block py-1 px-4 hover:bg-vega-light-100"
              >
                <div>{market.tradableInstrument.instrument.code}</div>
                <div className="text-xs">
                  <div>
                    {MarketStateMapping[market.state]} |{' '}
                    {MarketTradingModeMapping[market.tradingMode]}
                  </div>
                  <div>best bid price: {market.data?.bestBidPrice}</div>
                  <div>best bid volume: {market.data?.bestBidVolume}</div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </TinyScroll>
  );
};

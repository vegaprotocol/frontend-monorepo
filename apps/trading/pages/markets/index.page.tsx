import { Markets } from '@vegaprotocol/graphql';
import { useRouter } from 'next/router';
import { MarketListTable } from '@vegaprotocol/market-list';
import { useMarkets } from '../../hooks/use-markets';
import { Splash } from '@vegaprotocol/ui-toolkit';

const Markets = () => {
  const { pathname, push } = useRouter();
  const { markets, error, loading } = useMarkets();

  if (error) {
    return <Splash>Something went wrong: {error.message}</Splash>;
  }

  if (loading) {
    return <Splash>Loading...</Splash>;
  }

  return (
    <MarketListTable
      markets={markets}
      onRowClicked={(id) =>
        push(`${pathname}/${id}?portfolio=orders&trade=orderbook`)
      }
    />
  );
};

export default Markets;

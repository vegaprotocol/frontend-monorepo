import { Markets } from '@vegaprotocol/graphql';
import { useRouter } from 'next/router';
import { MarketListTable } from '@vegaprotocol/market-list';
import { useMarkets } from '../../hooks/use-markets';
import { AsyncRenderer } from '../../components/async-renderer';

const Markets = () => {
  const { pathname, push } = useRouter();
  const { markets, error, loading } = useMarkets();

  return (
    <AsyncRenderer loading={loading} error={error} data={markets}>
      {(data) => (
        <MarketListTable
          markets={data}
          onRowClicked={(id) =>
            push(`${pathname}/${id}?portfolio=orders&trade=orderbook`)
          }
        />
      )}
    </AsyncRenderer>
  );
};

export default Markets;

import { useRouter } from 'next/router';
import { MarketsContainer } from '@vegaprotocol/market-list';
import { useGlobalStore } from '../../stores';

const Markets = () => {
  const store = useGlobalStore();
  const router = useRouter();
  return (
    <MarketsContainer
      onSelect={(marketId) => {
        store.setMarketId(marketId);
        router.push(`/markets/${marketId}`);
      }}
    />
  );
};

Markets.getInitialProps = () => ({
  page: 'markets',
});

export default Markets;

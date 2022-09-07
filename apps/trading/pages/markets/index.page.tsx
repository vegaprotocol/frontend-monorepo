import { useRouter } from 'next/router';
import { MarketsContainer } from '@vegaprotocol/market-list';
import { useGlobalStore } from '../../stores';

const Markets = () => {
  const { update } = useGlobalStore((store) => ({ update: store.update }));
  const router = useRouter();
  return (
    <MarketsContainer
      onSelect={(marketId) => {
        update({ marketId });
        router.push(`/markets/${marketId}`);
      }}
    />
  );
};

Markets.getInitialProps = () => ({
  page: 'markets',
});

export default Markets;

import { useRouter } from 'next/router';
import { MarketsContainer } from '@vegaprotocol/market-list';
import { useGlobalStore } from '../../stores';
import { useEffect } from 'react';
import { titlefy } from '@vegaprotocol/react-helpers';

const Markets = () => {
  const { update } = useGlobalStore((store) => ({ update: store.update }));
  useEffect(() => {
    update({ pageTitle: titlefy(['Markets']) });
  }, [update]);

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

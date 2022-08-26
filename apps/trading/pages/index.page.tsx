import { useMarketList } from '@vegaprotocol/market-list';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useGlobalStore } from '../stores';

export function Index() {
  const { replace } = useRouter();
  // The default market selected in the platform behind the overlay
  // should be the oldest market that is currently trading in continuous mode(i.e. not in auction).
  const { data, error, loading } = useMarketList();
  const setLandingDialog = useGlobalStore((state) => state.setLandingDialog);

  useEffect(() => {
    if (data) {
      const marketId = data[0]?.id;

      // If a default market is found, go to it with the landing dialog open
      if (marketId) {
        setLandingDialog(true);
        replace(`/markets/${marketId}`);
      }
      // Fallback to the markets list page
      else {
        replace('/markets');
      }
    }
  }, [data, replace, setLandingDialog]);

  return (
    <AsyncRenderer data={data} loading={loading} error={error}>
      {/* Render a loading and error state but we will redirect if markets are found */}
      {null}
    </AsyncRenderer>
  );
}

Index.getInitialProps = () => ({
  page: 'home',
});

export default Index;

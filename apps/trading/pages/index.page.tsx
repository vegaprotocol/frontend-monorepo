import { useMarketList } from '@vegaprotocol/market-list';
import {
  addDecimalsFormatNumber,
  LocalStorage,
  titlefy,
} from '@vegaprotocol/react-helpers';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useGlobalStore } from '../stores';

export function Index() {
  const { replace } = useRouter();
  // The default market selected in the platform behind the overlay
  // should be the oldest market that is currently trading in continuous mode(i.e. not in auction).
  const { data, error, loading } = useMarketList();
  const { riskNoticeDialog, update } = useGlobalStore((store) => ({
    riskNoticeDialog: store.riskNoticeDialog,
    update: store.update,
  }));

  useEffect(() => {
    update({ landingDialog: true });

    if (data) {
      const marketId = LocalStorage.getItem('marketId') || data.markets[0]?.id;
      const marketName = data.markets[0]?.tradableInstrument.instrument.name;
      const marketPrice = data.marketsData[0]?.markPrice
        ? addDecimalsFormatNumber(
            data.marketsData[0]?.markPrice,
            data.markets[0].decimalPlaces
          )
        : null;
      const pageTitle = titlefy([marketName, marketPrice]);

      if (marketId) {
        replace(`/markets/${marketId}`);
        update({ marketId, pageTitle });
      }
      // Fallback to the markets list page
      else {
        replace('/markets');
      }
    }
  }, [data, replace, riskNoticeDialog, update]);

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

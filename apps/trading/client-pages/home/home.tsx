import { marketsWithDataProvider } from '@vegaprotocol/market-list';
import {
  addDecimalsFormatNumber,
  titlefy,
  useDataProvider,
} from '@vegaprotocol/react-helpers';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalStore, usePageTitleStore } from '../../stores';

export const Home = () => {
  const navigate = useNavigate();
  // The default market selected in the platform behind the overlay
  // should be the oldest market that is currently trading in     us mode(i.e. not in auction).
  const { data, error, loading } = useDataProvider({
    dataProvider: marketsWithDataProvider,
  });
  const { riskNoticeDialog, update } = useGlobalStore((store) => ({
    riskNoticeDialog: store.riskNoticeDialog,
    update: store.update,
  }));

  const { pageTitle, updateTitle } = usePageTitleStore((store) => ({
    pageTitle: store.pageTitle,
    updateTitle: store.updateTitle,
  }));

  useEffect(() => {
    update({ landingDialog: true });

    if (data) {
      const marketId = data[0]?.id;
      const marketName = data[0]?.tradableInstrument.instrument.name;
      const marketPrice = data[0]?.data?.markPrice
        ? addDecimalsFormatNumber(
            data[0]?.data?.markPrice,
            data[0]?.decimalPlaces
          )
        : null;
      const newPageTitle = titlefy([marketName, marketPrice]);

      if (marketId) {
        navigate(`/markets/${marketId}`, { replace: true });
        update({ marketId });
        if (pageTitle !== newPageTitle) {
          updateTitle(newPageTitle);
        }
      }
      // Fallback to the markets list page
      else {
        navigate('/markets');
      }
    } else {
      update({ welcomeNoticeDialog: true });
    }
  }, [data, navigate, riskNoticeDialog, update, pageTitle, updateTitle]);

  return (
    <AsyncRenderer data={data} loading={loading} error={error}>
      {/* Render a loading and error state but we will redirect if markets are found */}
      {null}
    </AsyncRenderer>
  );
};

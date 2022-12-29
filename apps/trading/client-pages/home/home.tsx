import type { SingleMarketFieldsFragment } from '@vegaprotocol/market-list';
import {
  marketProvider,
  marketsWithDataProvider,
} from '@vegaprotocol/market-list';
import {
  addDecimalsFormatNumber,
  titlefy,
  useDataProvider,
} from '@vegaprotocol/react-helpers';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { Links, Routes } from '../../pages/client-router';
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalStore, usePageTitleStore } from '../../stores';

export const Home = () => {
  const navigate = useNavigate();
  // The default market selected in the platform behind the overlay
  // should be the oldest market that is currently trading in     us mode(i.e. not in auction).
  const { data, error, loading } = useDataProvider({
    dataProvider: marketsWithDataProvider,
  });
  const { update, marketId } = useGlobalStore((store) => ({
    update: store.update,
    marketId: store.marketId,
  }));
  const variables = useMemo(
    () => ({
      marketId: marketId || '',
    }),
    [marketId]
  );
  const { data: singleMarketData, loading: singleMarketLoading } =
    useDataProvider<SingleMarketFieldsFragment, never>({
      dataProvider: marketProvider,
      variables,
      skip: !marketId,
    });
  const marketExists = Boolean(singleMarketData);
  const marketNotExists = !marketExists && !singleMarketLoading;
  const { pageTitle, updateTitle } = usePageTitleStore((store) => ({
    pageTitle: store.pageTitle,
    updateTitle: store.updateTitle,
  }));

  useEffect(() => {
    if (marketExists) {
      navigate(Links[Routes.MARKET](marketId as string), {
        replace: true,
      });
      update({ shouldDisplayWelcomeDialog: false });
    } else if (data && marketNotExists) {
      const marketDataId = data[0]?.id;
      const marketName = data[0]?.tradableInstrument.instrument.name;
      const marketPrice = data[0]?.data?.markPrice
        ? addDecimalsFormatNumber(
            data[0]?.data?.markPrice,
            data[0]?.decimalPlaces
          )
        : null;
      const newPageTitle = titlefy([marketName, marketPrice]);

      if (marketDataId) {
        navigate(Links[Routes.MARKET](marketDataId), {
          replace: true,
        });
        update({ marketId: marketDataId, shouldDisplayWelcomeDialog: true });
        if (pageTitle !== newPageTitle) {
          updateTitle(newPageTitle);
        }
      } else {
        navigate(Links[Routes.MARKET]());
      }
    }
  }, [
    marketExists,
    marketNotExists,
    marketId,
    data,
    navigate,
    update,
    pageTitle,
    updateTitle,
  ]);

  return (
    <AsyncRenderer data={data} loading={loading} error={error}>
      {/* Render a loading and error state but we will redirect if markets are found */}
      {null}
    </AsyncRenderer>
  );
};

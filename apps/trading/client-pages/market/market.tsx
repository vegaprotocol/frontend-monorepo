import React, { useEffect, useMemo } from 'react';
import { addDecimalsFormatNumber, titlefy } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { useScreenDimensions } from '@vegaprotocol/react-helpers';
import { useThrottledDataProvider } from '@vegaprotocol/data-provider';
import { AsyncRenderer, ExternalLink, Splash } from '@vegaprotocol/ui-toolkit';
import { getAsset, marketDataProvider, useMarket } from '@vegaprotocol/markets';
import { useGlobalStore, usePageTitleStore } from '../../stores';
import { TradeGrid } from './trade-grid';
import { TradePanels } from './trade-panels';
import { useNavigate, useParams } from 'react-router-dom';
import { Links } from '../../lib/links';
import { ViewType, useSidebar } from '../../components/sidebar';
import { useGetCurrentRouteId } from '../../lib/hooks/use-get-current-route-id';

const calculatePrice = (markPrice?: string, decimalPlaces?: number) => {
  return markPrice && decimalPlaces
    ? addDecimalsFormatNumber(markPrice, decimalPlaces)
    : '-';
};

const TitleUpdater = ({
  marketId,
  marketName,
  decimalPlaces,
}: {
  marketId?: string;
  marketName?: string;
  decimalPlaces?: number;
}) => {
  const pageTitle = usePageTitleStore((store) => store.pageTitle);
  const updateTitle = usePageTitleStore((store) => store.updateTitle);
  const { data: marketData } = useThrottledDataProvider(
    {
      dataProvider: marketDataProvider,
      variables: { marketId: marketId || '' },
      skip: !marketId,
    },
    1000
  );
  useEffect(() => {
    const marketPrice = calculatePrice(marketData?.markPrice, decimalPlaces);
    if (marketName) {
      const newPageTitle = titlefy([marketName, marketPrice]);
      if (pageTitle !== newPageTitle) {
        updateTitle(newPageTitle);
      }
    }
  }, [
    decimalPlaces,
    marketName,
    marketData?.markPrice,
    pageTitle,
    updateTitle,
  ]);
  return null;
};

export const MarketPage = () => {
  const { marketId } = useParams();
  const navigate = useNavigate();
  const currentRouteId = useGetCurrentRouteId();
  const { setViews, getView } = useSidebar();
  const view = getView(currentRouteId);
  const { screenSize } = useScreenDimensions();
  const largeScreen = ['lg', 'xl', 'xxl', 'xxxl'].includes(screenSize);
  const update = useGlobalStore((store) => store.update);
  const lastMarketId = useGlobalStore((store) => store.marketId);

  const { data, error, loading } = useMarket(marketId);

  useEffect(() => {
    if (data?.id && data.id !== lastMarketId) {
      update({ marketId: data.id });
    }
  }, [update, lastMarketId, data?.id]);

  useEffect(() => {
    if (largeScreen && view === undefined) {
      setViews({ type: ViewType.Order }, currentRouteId);
    }
  }, [setViews, view, currentRouteId, largeScreen]);

  const pinnedAsset = data && getAsset(data);

  const tradeView = useMemo(() => {
    if (pinnedAsset) {
      if (largeScreen) {
        return <TradeGrid market={data} pinnedAsset={pinnedAsset} />;
      }
      return <TradePanels market={data} pinnedAsset={pinnedAsset} />;
    }
  }, [largeScreen, data, pinnedAsset]);

  if (!data && marketId) {
    return (
      <Splash>
        <span className="flex flex-col items-center gap-2">
          <p className="justify-center text-sm">
            {t('This market URL is not available any more.')}
          </p>
          <p className="justify-center text-sm">
            {t(`Please choose another market from the`)}{' '}
            <ExternalLink onClick={() => navigate(Links.MARKETS())}>
              market list
            </ExternalLink>
          </p>
        </span>
      </Splash>
    );
  }

  return (
    <AsyncRenderer
      loading={loading}
      error={error}
      data={data || undefined}
      noDataCondition={(data) => false}
    >
      <TitleUpdater
        marketId={data?.id}
        marketName={data?.tradableInstrument.instrument.name}
        decimalPlaces={data?.decimalPlaces}
      />
      {tradeView}
    </AsyncRenderer>
  );
};

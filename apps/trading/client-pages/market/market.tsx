import React, { useEffect, useMemo } from 'react';
import { addDecimalsFormatNumber, titlefy } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { useScreenDimensions } from '@vegaprotocol/react-helpers';
import { useThrottledDataProvider } from '@vegaprotocol/data-provider';
import { ExternalLink, Loader, Splash } from '@vegaprotocol/ui-toolkit';
import { getAsset, marketDataProvider, useMarket } from '@vegaprotocol/markets';
import { useGlobalStore, usePageTitleStore } from '../../stores';
import { TradeGrid } from './trade-grid';
import { TradePanels } from './trade-panels';
import { useNavigate, useParams } from 'react-router-dom';
import { Links, Routes } from '../../lib/links';
import { ViewType, useSidebar } from '../../components/sidebar';
import { useGetCurrentRouteId } from '../../lib/hooks/use-get-current-route-id';
import { MarketState } from '@vegaprotocol/types';

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

export const MarketPage = ({ closed }: { closed?: boolean }) => {
  const { marketId } = useParams();
  const navigate = useNavigate();
  const currentRouteId = useGetCurrentRouteId();
  const { setViews, getView } = useSidebar();
  const view = getView(currentRouteId);
  const { screenSize } = useScreenDimensions();
  const largeScreen = ['lg', 'xl', 'xxl', 'xxxl'].includes(screenSize);
  const update = useGlobalStore((store) => store.update);
  const lastMarketId = useGlobalStore((store) => store.marketId);

  const { data, loading } = useMarket(marketId);

  useEffect(() => {
    if (
      data?.state &&
      [
        MarketState.STATE_SETTLED,
        MarketState.STATE_TRADING_TERMINATED,
      ].includes(data.state) &&
      currentRouteId !== Routes.CLOSED_MARKETS &&
      marketId
    ) {
      navigate(Links.CLOSED_MARKETS(marketId));
    }
  }, [data?.state, currentRouteId, navigate, marketId]);

  useEffect(() => {
    if (data?.id && data.id !== lastMarketId && !closed) {
      update({ marketId: data.id });
    }
  }, [update, lastMarketId, data?.id, closed]);

  useEffect(() => {
    if (largeScreen && view === undefined) {
      setViews(
        { type: closed ? ViewType.Info : ViewType.Order },
        currentRouteId
      );
    }
  }, [setViews, view, currentRouteId, largeScreen, closed]);

  const pinnedAsset = data && getAsset(data);

  const tradeView = useMemo(() => {
    if (pinnedAsset) {
      if (largeScreen) {
        return <TradeGrid market={data} pinnedAsset={pinnedAsset} />;
      }
      return <TradePanels market={data} pinnedAsset={pinnedAsset} />;
    }
  }, [largeScreen, data, pinnedAsset]);

  if (loading) {
    return (
      <Splash>
        <Loader />
      </Splash>
    );
  }

  if (!data) {
    return (
      <Splash>
        <span className="flex flex-col items-center gap-2">
          <p className="justify-center text-sm">
            {t('This market URL is not available any more.')}
          </p>
          <p className="justify-center text-sm">
            {t(`Please choose another market from the`)}{' '}
            <ExternalLink onClick={() => navigate(Links.MARKETS())}>
              {t('market list')}
            </ExternalLink>
          </p>
        </span>
      </Splash>
    );
  }

  return (
    <>
      <TitleUpdater
        marketId={data?.id}
        marketName={data?.tradableInstrument.instrument.name}
        decimalPlaces={data?.decimalPlaces}
      />
      {tradeView}
    </>
  );
};

import React, { useEffect, useMemo } from 'react';
import { addDecimalsFormatNumber, titlefy } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { useScreenDimensions } from '@vegaprotocol/react-helpers';
import { useThrottledDataProvider } from '@vegaprotocol/data-provider';
import { AsyncRenderer, ExternalLink, Splash } from '@vegaprotocol/ui-toolkit';
import type { MarketFieldsFragment } from '@vegaprotocol/markets';
import { marketDataProvider, useMarket } from '@vegaprotocol/markets';
import { useGlobalStore, usePageTitleStore } from '../../stores';
import { TradeGrid } from './trade-grid';
import { TradePanels } from './trade-panels';
import { useNavigate, useParams } from 'react-router-dom';
import { Links, Routes } from '../../pages/client-router';
import { ViewType, useSidebar } from '../../components/sidebar';

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
  const { init, view, setView } = useSidebar();
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

  // Make sidebar open on deal ticket by default
  useEffect(() => {
    if (init && view === null) {
      setView({ type: ViewType.Order });
    }
  }, [init, view, setView]);

  const pinnedAsset = getAsset(data);

  const tradeView = useMemo(() => {
    if (largeScreen) {
      return <TradeGrid market={data} pinnedAsset={pinnedAsset} />;
    }
    return <TradePanels market={data} pinnedAsset={pinnedAsset} />;
  }, [largeScreen, data, pinnedAsset]);

  if (!data && marketId) {
    return (
      <Splash>
        <span className="flex flex-col items-center gap-2">
          <p className="text-sm justify-center">
            {t('This market URL is not available any more.')}
          </p>
          <p className="text-sm justify-center">
            {t(`Please choose another market from the`)}{' '}
            <ExternalLink onClick={() => navigate(Links[Routes.MARKETS]())}>
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

const getAsset = (market: MarketFieldsFragment | null) => {
  return market &&
    'settlementAsset' in market.tradableInstrument.instrument.product
    ? market?.tradableInstrument.instrument.product?.settlementAsset
    : {
        id: '',
        symbol: '',
        decimals: 0,
        name: '',
      };
};

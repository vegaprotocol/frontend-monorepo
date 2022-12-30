import React, { useCallback, useEffect, useMemo, useState } from 'react';
import debounce from 'lodash/debounce';
import {
  addDecimalsFormatNumber,
  t,
  titlefy,
  useDataProvider,
} from '@vegaprotocol/react-helpers';
import { AsyncRenderer, Splash } from '@vegaprotocol/ui-toolkit';
import type {
  SingleMarketFieldsFragment,
  MarketData,
  Candle,
  MarketDataUpdateFieldsFragment,
} from '@vegaprotocol/market-list';

import { marketProvider, marketDataProvider } from '@vegaprotocol/market-list';
import { useGlobalStore, usePageTitleStore } from '../../stores';
import { TradeGrid, TradePanels } from './trade-grid';
import { useNavigate, useParams } from 'react-router-dom';
import { Links, Routes } from '../../pages/client-router';

const calculatePrice = (markPrice?: string, decimalPlaces?: number) => {
  return markPrice && decimalPlaces
    ? addDecimalsFormatNumber(markPrice, decimalPlaces)
    : '-';
};

export interface SingleMarketData extends SingleMarketFieldsFragment {
  candles: Candle[];
  data: MarketData;
}

export const Market = () => {
  const { marketId } = useParams();
  const navigate = useNavigate();

  const { w } = useWindowSize();
  const { update, marketId: lastMarketId } = useGlobalStore((store) => ({
    update: store.update,
    marketId: store.marketId,
  }));

  const { pageTitle, updateTitle } = usePageTitleStore((store) => ({
    pageTitle: store.pageTitle,
    updateTitle: store.updateTitle,
  }));

  const onSelect = useCallback(
    (id: string) => {
      if (id && id !== marketId) {
        navigate(Links[Routes.MARKET](id));
      }
    },
    [marketId, navigate]
  );

  const variables = useMemo(
    () => ({
      marketId: marketId || '',
    }),
    [marketId]
  );

  const updateMarketId = useCallback(
    ({ data }: { data: { id?: string } | null }) => {
      if (data?.id && data.id !== lastMarketId) {
        update({ marketId: data.id });
      }
      return true;
    },
    [update, lastMarketId]
  );
  const { data, error, loading } = useDataProvider<
    SingleMarketFieldsFragment,
    never
  >({
    dataProvider: marketProvider,
    variables,
    update: updateMarketId,
    skip: !marketId,
  });

  const marketName = data?.tradableInstrument.instrument.name;
  const updateProvider = useCallback(
    ({ data: marketData }: { data: MarketData | null }) => {
      const marketPrice = calculatePrice(
        marketData?.markPrice,
        data?.decimalPlaces
      );
      if (marketName) {
        const newPageTitle = titlefy([marketName, marketPrice]);
        if (pageTitle !== newPageTitle) {
          updateTitle(newPageTitle);
        }
      }
      return true;
    },
    [updateTitle, pageTitle, marketName, data?.decimalPlaces]
  );

  useDataProvider<MarketData, MarketDataUpdateFieldsFragment>({
    dataProvider: marketDataProvider,
    update: updateProvider,
    variables,
    skip: !marketId || !data,
  });

  const tradeView = useMemo(() => {
    if (w > 960) {
      return <TradeGrid market={data} onSelect={onSelect} />;
    }
    return <TradePanels market={data} onSelect={onSelect} />;
  }, [w, data, onSelect]);
  if (!data && marketId) {
    return (
      <Splash>
        <p>{t('Market not found')}</p>
      </Splash>
    );
  }

  return (
    <AsyncRenderer<SingleMarketFieldsFragment>
      loading={loading}
      error={error}
      data={data || undefined}
      noDataCondition={(data) => false}
    >
      {tradeView}
    </AsyncRenderer>
  );
};

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState(() => {
    if (typeof window !== 'undefined') {
      return {
        w: window.innerWidth,
        h: window.innerHeight,
      };
    }

    // Something sensible for server rendered page
    return {
      w: 1200,
      h: 900,
    };
  });

  useEffect(() => {
    const handleResize = debounce(({ target }) => {
      setWindowSize({
        w: target.innerWidth,
        h: target.innerHeight,
      });
    }, 300);

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return windowSize;
};

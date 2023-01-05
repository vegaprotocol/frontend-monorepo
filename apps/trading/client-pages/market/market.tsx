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
} from '@vegaprotocol/market-list';

import { useMarket } from '@vegaprotocol/market-list';
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
  const update = useGlobalStore((store) => store.update);
  const lastMarketId = useGlobalStore((store) => store.marketId);

  const pageTitle = usePageTitleStore((store) => store.pageTitle);
  const updateTitle = usePageTitleStore((store) => store.updateTitle);

  const onSelect = useCallback(
    (id: string) => {
      if (id && id !== marketId) {
        navigate(Links[Routes.MARKET](id));
      }
    },
    [marketId, navigate]
  );

  const { data, loading, error } = useMarket(marketId);

  const tradeView = useMemo(() => {
    if (!data?.market) {
      return null;
    }

    if (w > 960) {
      return <TradeGrid market={data.market} onSelect={onSelect} />;
    }
    return <TradePanels market={data.market} onSelect={onSelect} />;
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
      data={data}
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

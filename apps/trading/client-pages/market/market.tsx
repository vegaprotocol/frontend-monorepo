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
import { Links } from '../../pages/client-router';

const calculatePrice = (markPrice?: string, decimalPlaces?: number) => {
  return markPrice && decimalPlaces
    ? addDecimalsFormatNumber(markPrice, decimalPlaces)
    : '-';
};

export interface SingleMarketData extends SingleMarketFieldsFragment {
  candles: Candle[];
  data: MarketData;
}

type MarketProps = {
  skeleton?: boolean;
};

export const Market = ({ skeleton }: MarketProps) => {
  const params = useParams();
  const navigate = useNavigate();

  const marketId = skeleton ? undefined : params.marketId;

  const { w } = useWindowSize();
  const { update } = useGlobalStore((store) => ({
    update: store.update,
  }));

  const { pageTitle, updateTitle } = usePageTitleStore((store) => ({
    pageTitle: store.pageTitle,
    updateTitle: store.updateTitle,
  }));

  const onSelect = useCallback(
    (id: string) => {
      if (id && id !== marketId) {
        update({ marketId: id });
        navigate(Links.MARKET(id));
      }
    },
    [marketId, update, navigate]
  );

  const variables = useMemo(
    () => ({
      marketId: marketId || '',
    }),
    [marketId]
  );

  const { data, error, loading } = useDataProvider<
    SingleMarketFieldsFragment,
    never
  >({
    dataProvider: marketProvider,
    variables,
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

  if (!marketId && !skeleton) {
    return (
      <Splash>
        <p>{t('Not found')}</p>
      </Splash>
    );
  }

  return (
    <AsyncRenderer<SingleMarketFieldsFragment>
      loading={loading}
      error={error}
      data={data || undefined}
      noDataCondition={(data) => false}
      render={(data) => {
        if (!data && !skeleton) {
          return <Splash>{t('Market not found')}</Splash>;
        }
        return <>{tradeView}</>;
      }}
    />
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

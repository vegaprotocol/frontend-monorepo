import React, { useCallback, useEffect, useMemo, useState } from 'react';
import debounce from 'lodash/debounce';
import {
  addDecimalsFormatNumber,
  t,
  titlefy,
  usePrevious,
} from '@vegaprotocol/react-helpers';
import { AsyncRenderer, Splash } from '@vegaprotocol/ui-toolkit';

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

export const Market = () => {
  const { marketId } = useParams();
  const navigate = useNavigate();
  const { w } = useWindowSize();
  const { data, loading, error } = useMarket(marketId);
  const update = useGlobalStore((store) => store.update);
  const updateTitle = usePageTitleStore((store) => store.updateTitle);
  const prevMarkPrice = usePrevious(data?.market?.data?.markPrice);

  // Store last market id for easier so we can load
  // previous last market when visiting index page
  useEffect(() => {
    update({ marketId });
  }, [marketId, update]);

  // set page title, _app.page.tsx will pick this up and
  // update it via the <Title /> component
  useEffect(() => {
    if (!data?.market?.data) return;
    if (prevMarkPrice !== data.market.data.markPrice) {
      const marketName = data.market.tradableInstrument.instrument.name;
      const marketPrice = calculatePrice(
        data.market.data?.markPrice,
        data.market.decimalPlaces
      );
      const newPageTitle = titlefy([marketName, marketPrice]);
      updateTitle(newPageTitle);
    }
  }, [data?.market, prevMarkPrice, updateTitle]);

  const onSelect = useCallback(
    (id: string) => {
      if (id && id !== marketId) {
        navigate(Links[Routes.MARKET](id));
      }
    },
    [marketId, navigate]
  );

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
    <AsyncRenderer
      loading={loading}
      error={error}
      data={data?.market}
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

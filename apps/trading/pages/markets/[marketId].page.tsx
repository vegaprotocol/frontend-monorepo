import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';
import {
  addDecimalsFormatNumber,
  makeDerivedDataProvider,
  t,
  titlefy,
  useDataProvider,
} from '@vegaprotocol/react-helpers';
import { Interval } from '@vegaprotocol/types';
import { AsyncRenderer, Splash } from '@vegaprotocol/ui-toolkit';
import isEqual from 'lodash/isEqual';
import debounce from 'lodash/debounce';
import { useRouter } from 'next/router';

import type { Market, MarketData, Candle } from '@vegaprotocol/market-list';
import { useGlobalStore } from '../../stores';
import { TradeGrid, TradePanels } from './trade-grid';
import { ColumnKind, SelectMarketDialog } from '../../components/select-market';
import {
  marketProvider,
  marketCandlesProvider,
  marketDataProvider,
} from '@vegaprotocol/market-list';

const calculatePrice = (markPrice?: string, decimalPlaces?: number) => {
  return markPrice && decimalPlaces
    ? addDecimalsFormatNumber(markPrice, decimalPlaces)
    : '-';
};

export interface SingleMarketData extends Market {
  candles: Candle[];
  data: MarketData;
}

const dataProvider = makeDerivedDataProvider<SingleMarketData, never>(
  [marketProvider, marketCandlesProvider, marketDataProvider],
  ([market, candles, marketData]) => {
    return {
      ...market,
      candles,
      data: marketData,
    };
  }
);

const MarketPage = ({ id }: { id?: string }) => {
  const [marketPrice, setMarketPrice] = useState('');
  const dataRef = useRef<SingleMarketData | null>(null);
  const { query, push } = useRouter();
  const { w } = useWindowSize();
  const { landingDialog, riskNoticeDialog, update } = useGlobalStore(
    (store) => ({
      landingDialog: store.landingDialog,
      riskNoticeDialog: store.riskNoticeDialog,
      update: store.update,
    })
  );
  const { update: updateStore } = useGlobalStore((store) => ({
    update: store.update,
  }));
  const { open: openAssetDetailsDialog } = useAssetDetailsDialogStore();

  // Default to first marketId query item if found
  const marketId =
    id || (Array.isArray(query.marketId) ? query.marketId[0] : query.marketId);

  const onSelect = (id: string) => {
    if (id && id !== marketId) {
      updateStore({ marketId: id });
      push(`/markets/${id}`);
    }
  };

  // Cache timestamp for yesterday to prevent full unmount of market page when
  // a rerender occurs
  const yTimestamp = useMemo(() => {
    const yesterday = Math.round(new Date().getTime() / 1000) - 24 * 3600;
    return new Date(yesterday * 1000).toISOString();
  }, []);

  const variables = useMemo(
    () => ({
      marketId: marketId || '',
      interval: Interval.INTERVAL_I1H,
      since: yTimestamp,
    }),
    [marketId, yTimestamp]
  );

  const dataUpdate = useCallback(
    ({ data }: { data: SingleMarketData }) => {
      setMarketPrice(calculatePrice(data.data.markPrice, data.decimalPlaces));
      if (isEqual(data, dataRef.current)) {
        return true;
      }
      dataRef.current = data;
      return false;
    },
    [setMarketPrice]
  );

  const {
    data: dataProvided,
    error,
    loading,
  } = useDataProvider({
    dataProvider,
    update: dataUpdate,
    variables,
    skip: !marketId,
  });
  dataRef.current = dataProvided;
  const marketName = dataProvided?.tradableInstrument.instrument.name;

  useEffect(() => {
    if (marketName) {
      const pageTitle = titlefy([marketName, marketPrice]);
      update({ pageTitle });
    }
  }, [marketName, update, marketPrice]);

  if (!marketId) {
    return (
      <Splash>
        <p>{t('Not found')}</p>
      </Splash>
    );
  }

  return (
    <AsyncRenderer<SingleMarketData>
      loading={loading}
      error={error}
      data={dataProvided || undefined}
      render={(data) => {
        if (!data) {
          return <Splash>{t('Market not found')}</Splash>;
        }
        return (
          <>
            {w > 960 ? (
              <TradeGrid market={data} onSelect={onSelect} />
            ) : (
              <TradePanels market={data} onSelect={onSelect} />
            )}
            <SelectMarketDialog
              dialogOpen={landingDialog && !riskNoticeDialog}
              setDialogOpen={(isOpen: boolean) =>
                update({ landingDialog: isOpen })
              }
              onSelect={onSelect}
              onCellClick={(e, kind, value) => {
                if (value && kind === ColumnKind.Asset) {
                  openAssetDetailsDialog(value, e.target as HTMLElement);
                }
              }}
            />
          </>
        );
      }}
    />
  );
};

MarketPage.getInitialProps = () => ({
  page: 'market',
});

export default MarketPage;

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

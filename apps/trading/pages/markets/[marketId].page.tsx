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
  useYesterday,
} from '@vegaprotocol/react-helpers';
import { Interval } from '@vegaprotocol/types';
import { AsyncRenderer, Splash } from '@vegaprotocol/ui-toolkit';
import isEqual from 'lodash/isEqual';
import debounce from 'lodash/debounce';
import { useRouter } from 'next/router';
import type {
  SingleMarketFieldsFragment,
  MarketData,
  Candle,
} from '@vegaprotocol/market-list';
import {
  marketProvider,
  marketCandlesProvider,
  marketDataProvider,
} from '@vegaprotocol/market-list';
import { useGlobalStore } from '../../stores';
import { TradeGrid, TradePanels } from './trade-grid';
import { ColumnKind, SelectMarketDialog } from '../../components/select-market';

const calculatePrice = (markPrice?: string, decimalPlaces?: number) => {
  return markPrice && decimalPlaces
    ? addDecimalsFormatNumber(markPrice, decimalPlaces)
    : '-';
};

export interface SingleMarketData extends SingleMarketFieldsFragment {
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

  const onSelect = useCallback(
    (id: string) => {
      if (id && id !== marketId) {
        updateStore({ marketId: id });
        push(`/markets/${id}`);
      }
    },
    [marketId, updateStore, push]
  );

  const yesterday = useYesterday();
  // Cache timestamp for yesterday to prevent full unmount of market page when
  // a rerender occurs
  const yTimestamp = useMemo(() => {
    return new Date(yesterday).toISOString();
  }, [yesterday]);

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

  const { data, error, loading } = useDataProvider({
    dataProvider,
    update: dataUpdate,
    variables,
    skip: !marketId,
  });
  dataRef.current = data;
  const marketName = data?.tradableInstrument.instrument.name;

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
      data={data || undefined}
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

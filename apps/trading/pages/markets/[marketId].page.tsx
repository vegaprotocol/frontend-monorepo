import React, { useCallback, useEffect, useMemo, useState } from 'react';
import debounce from 'lodash/debounce';
import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';
import {
  addDecimalsFormatNumber,
  t,
  titlefy,
  useDataProvider,
} from '@vegaprotocol/react-helpers';
import { AsyncRenderer, Splash } from '@vegaprotocol/ui-toolkit';
import { useRouter } from 'next/router';
import type {
  SingleMarketFieldsFragment,
  MarketData,
  Candle,
  MarketDataUpdateFieldsFragment,
} from '@vegaprotocol/market-list';
import { marketProvider, marketDataProvider } from '@vegaprotocol/market-list';
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

const MarketPage = ({
  id,
  marketId: mid,
}: {
  id?: string;
  marketId?: string;
}) => {
  const { query, push } = useRouter();
  const { w } = useWindowSize();
  const {
    landingDialog,
    riskNoticeDialog,
    update,
    updateTitle,
    updateMarketId,
  } = useGlobalStore((store) => ({
    landingDialog: store.landingDialog,
    riskNoticeDialog: store.riskNoticeDialog,
    update: store.update,
    updateTitle: store.updateTitle,
    updateMarketId: store.updateMarketId,
  }));

  const { open: openAssetDetailsDialog } = useAssetDetailsDialogStore();

  // Default to first marketId query item if found
  const marketId =
    id || (Array.isArray(query.marketId) ? query.marketId[0] : query.marketId);

  const onSelect = useCallback(
    (id: string) => {
      if (id && id !== marketId) {
        updateMarketId(id);
        push(`/markets/${id}`);
      }
    },
    [marketId, updateMarketId, push]
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

  const updateProvider = useCallback(
    ({ data: marketData }: { data: MarketData }) => {
      const marketName = data?.tradableInstrument.instrument.name;
      const marketPrice = calculatePrice(
        marketData.markPrice,
        data?.decimalPlaces
      );
      if (marketName) {
        const pageTitle = titlefy([marketName, marketPrice]);
        updateTitle(pageTitle);
      }
      return true;
    },
    [updateTitle, data?.tradableInstrument.instrument.name, data?.decimalPlaces]
  );

  useDataProvider<MarketData, MarketDataUpdateFieldsFragment>({
    dataProvider: marketDataProvider,
    update: updateProvider,
    variables,
    skip: !marketId || !data,
    updateOnInit: true,
  });

  if (!marketId) {
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

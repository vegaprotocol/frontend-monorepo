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
import type {
  SingleMarketFieldsFragment,
  MarketData,
  Candle,
  MarketDataUpdateFieldsFragment,
} from '@vegaprotocol/market-list';
import { marketProvider, marketDataProvider } from '@vegaprotocol/market-list';
import { useGlobalStore, usePageTitleStore } from '../../stores';
import { TradeGrid, TradePanels } from './trade-grid';
import { ColumnKind, SelectMarketDialog } from '../../components/select-market';
import { useNavigate, useParams } from 'react-router-dom';

const calculatePrice = (markPrice?: string, decimalPlaces?: number) => {
  return markPrice && decimalPlaces
    ? addDecimalsFormatNumber(markPrice, decimalPlaces)
    : '-';
};

export interface SingleMarketData extends SingleMarketFieldsFragment {
  candles: Candle[];
  data: MarketData;
}

export const Market = ({
  id,
  marketId: mid,
}: {
  id?: string;
  marketId?: string;
}) => {
  const params = useParams();
  const navigate = useNavigate();
  const marketId = params.marketId;
  const { w } = useWindowSize();
  const { landingDialog, riskNoticeDialog, update } = useGlobalStore(
    (store) => ({
      landingDialog: store.landingDialog,
      riskNoticeDialog: store.riskNoticeDialog,
      update: store.update,
    })
  );

  const { pageTitle, updateTitle } = usePageTitleStore((store) => ({
    pageTitle: store.pageTitle,
    updateTitle: store.updateTitle,
  }));

  const { open: openAssetDetailsDialog } = useAssetDetailsDialogStore();

  const onSelect = useCallback(
    (id: string) => {
      if (id && id !== marketId) {
        update({ marketId: id });
        navigate(`/markets/${id}`);
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
    if (!data) {
      return null;
    }
    if (w > 960) {
      return <TradeGrid market={data} onSelect={onSelect} />;
    }
    return <TradePanels market={data} onSelect={onSelect} />;
  }, [w, data, onSelect]);

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
            {tradeView}
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

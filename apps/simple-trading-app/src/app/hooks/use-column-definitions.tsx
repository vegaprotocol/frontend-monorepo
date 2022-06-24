import React, { useMemo } from 'react';
import { t } from '@vegaprotocol/react-helpers';
import type { SimpleMarkets_markets } from '../components/simple-market-list/__generated__/SimpleMarkets';
import MarketNameRenderer from '../components/simple-market-list/simple-market-renderer';
import SimpleMarketPercentChange from '../components/simple-market-list/simple-market-percent-change';
import { Button } from '@vegaprotocol/ui-toolkit';

interface Props {
  onClick: (marketId: string) => void;
}

const useColumnDefinitions = ({ onClick }: Props) => {
  const columnDefs = useMemo(() => {
    return [
      {
        colId: 'market',
        headerName: t('Markets'),
        headerClass: 'uppercase',
        minWidth: 300,
        cellRenderer: ({ data }: { data: SimpleMarkets_markets }) => (
          <MarketNameRenderer data={data} />
        ),
      },
      {
        colId: 'asset',
        headerName: t('Settlement asset'),
        headerClass: 'uppercase',
        cellClass: 'uppercase flex h-full items-center',
        cellRenderer: ({ data }: { data: SimpleMarkets_markets }) => (
          <div className="flex h-full items-center justify-center">
            {data.tradableInstrument.instrument.product.settlementAsset.symbol}
          </div>
        ),
      },
      {
        colId: 'change',
        headerName: t('24h change'),
        headerClass: 'uppercase',
        cellRenderer: ({ data }: { data: SimpleMarkets_markets }) => (
          <SimpleMarketPercentChange
            candles={data.candles}
            marketId={data.id}
          />
        ),
      },
      {
        colId: 'status',
        headerName: t('Status'),
        field: 'data.market.state',
        headerClass: 'uppercase',
        cellRenderer: ({ data }: { data: SimpleMarkets_markets }) => (
          <div className="uppercase flex h-full items-center justify-center">
            <div className="border text-center px-8">
              {data.data?.market.state}
            </div>
          </div>
        ),
      },
      {
        colId: 'trade',
        headerName: '',
        headerClass: 'uppercase',
        type: 'rightAligned',
        sortable: false,
        cellRenderer: ({ data }: { data: SimpleMarkets_markets }) => (
          <div className="h-full flex h-full items-center justify-end">
            <Button
              onClick={() => onClick(data.id)}
              variant="inline"
              appendIconName="arrow-top-right"
              className="uppercase"
            >
              {t('Trade')}
            </Button>
          </div>
        ),
      },
    ];
  }, [onClick]);

  const defaultColDef = useMemo(() => {
    return {
      sortable: true,
      unSortIcon: true,
    };
  }, []);

  return { columnDefs, defaultColDef };
};

export default useColumnDefinitions;

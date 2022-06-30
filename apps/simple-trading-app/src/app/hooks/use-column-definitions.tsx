import React, { useMemo } from 'react';
import { t } from '@vegaprotocol/react-helpers';
import type { SimpleMarkets_markets } from '../components/simple-market-list/__generated__/SimpleMarkets';
import MarketNameRenderer from '../components/simple-market-list/simple-market-renderer';
import SimpleMarketPercentChange from '../components/simple-market-list/simple-market-percent-change';
import { Button } from '@vegaprotocol/ui-toolkit';
import type { ValueSetterParams } from 'ag-grid-community';
import type { SimpleMarketsType } from '../components/simple-market-list/simple-market-list';

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
        field: 'name',
        cellRenderer: ({ data }: { data: SimpleMarketsType }) => (
          <MarketNameRenderer data={data} />
        ),
      },
      {
        colId: 'asset',
        headerName: t('Settlement asset'),
        headerClass: 'uppercase',
        minWidth: 100,
        cellClass: 'uppercase flex h-full items-center',
        field: 'tradableInstrument.instrument.product.settlementAsset.symbol',
        cellRenderer: ({ data }: { data: SimpleMarketsType }) => (
          <div className="flex h-full items-center justify-center">
            {data.tradableInstrument.instrument.product.settlementAsset.symbol}
          </div>
        ),
      },
      {
        colId: 'change',
        headerName: t('24h change'),
        headerClass: 'uppercase',
        field: 'percentChange',
        minWidth: 100,
        valueSetter: (params: ValueSetterParams): boolean => {
          const { oldValue, newValue, api, data } = params;
          if (oldValue !== newValue) {
            const newdata = { percentChange: newValue, ...data };
            api.applyTransaction({ update: [newdata] });
            return true;
          }
          return false;
        },
        cellRenderer: ({
          data,
          setValue,
        }: {
          data: SimpleMarketsType;
          setValue: (arg: unknown) => void;
        }) => (
          <SimpleMarketPercentChange
            candles={data.candles}
            marketId={data.id}
            setValue={setValue}
          />
        ),
        comparator: (valueA: number | '-', valueB: number | '-') => {
          if (valueA === valueB) return 0;
          if (valueA === '-') {
            return -1;
          }
          if (valueB === '-') {
            return 1;
          }
          return valueA > valueB ? 1 : -1;
        },
      },
      {
        colId: 'status',
        headerName: t('Status'),
        field: 'data.market.state',
        headerClass: 'uppercase',
        minWidth: 100,
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
        sortable: false,
        minWidth: 100,
        cellRenderer: ({ data }: { data: SimpleMarkets_markets }) => (
          <div className="h-full flex h-full items-center justify-end">
            <Button
              onClick={() => onClick(data.id)}
              variant="inline-link"
              appendIconName="arrow-top-right"
              className="uppercase no-underline hover:no-underline"
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

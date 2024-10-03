import orderBy from 'lodash/orderBy';
import { Link } from 'react-router-dom';
import {
  useMarkets,
  isActiveMarket,
  type Market,
  useMarketsData,
} from '@vegaprotocol/rest';
import type {
  ICellRendererParams,
  IRowNode,
  ValueFormatterParams,
} from 'ag-grid-community';
import filter from 'lodash/filter';
import { useT } from '../../../lib/use-t';
import { Links } from '../../../lib/links';
import { AgGrid } from '@vegaprotocol/datagrid';
import { EmblemByMarket } from '@vegaprotocol/emblem';
import { HeaderPage } from '../../../components/header-page';
import { formatNumberPercentage } from '@vegaprotocol/utils';
import BigNumber from 'bignumber.js';
import { PriceChange } from '../../../components/amm/stats/price-change';
import { CompactVolume24 } from '../../../components/amm/stats/volume-24';
import { MyLiquidity } from 'apps/trading/components/amm/stats/my-liquidity';
import { Button, Input, Intent, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { type ReactNode, useMemo, useState } from 'react';
import trim from 'lodash/trim';
import { FilterSummary } from '../../../components/market-selector/filter-summary';

export const Pools = () => {
  const t = useT();
  const [filterTerm, setFilterTerm] = useState('');

  const { data } = useMarkets();
  const { data: marketsData } = useMarketsData();

  const markets = Array.from(data || []).map(([, v]) => v);

  const marketsWithData = markets.map((m) => ({
    ...m,
    markPrice: marketsData?.get(m.id)?.markPrice?.value,
  }));

  const rowData = orderBy(
    filter(marketsWithData, isActiveMarket),
    (m) => m.code,
    'asc'
  );

  const isExternalFilterPresent = () => true;
  const doesExternalFilterPass = (node: IRowNode<Market>) => {
    if (!node.data) return true;
    return filterMarket(node.data, filterTerm);
  };

  const columnDefs = useMemo(
    () => [
      {
        headerName: t('AMM_POOLS_TABLE_TH_NAME'),
        field: 'code',
        colId: 'name',
        flex: 1,
        cellRenderer: ({
          value,
          data,
        }: ICellRendererParams<Market, string>) => {
          return (
            value &&
            data && (
              <Link to={Links.AMM_POOL(data.id)}>
                <div className="flex gap-2 items-center">
                  {data?.id && <EmblemByMarket market={data?.id} />}
                  <span>{value}</span>
                </div>
              </Link>
            )
          );
        },
      },
      {
        headerName: t('AMM_POOLS_TABLE_TH_FEE'),
        field: 'liquidityFee',
        colId: 'fee',
        flex: 1,
        cellDataType: 'number',
        valueFormatter: ({ value }: ValueFormatterParams<Market, number>) =>
          formatNumberPercentage(BigNumber(value || 0).times(100)),
      },
      {
        headerName: t('AMM_POOLS_TABLE_TH_PRICE'),
        field: 'markPrice',
        colId: 'price',
        flex: 1,
        cellDataType: 'number',
        valueFormatter: ({
          value,
          data,
        }: ValueFormatterParams<typeof rowData[0], BigNumber | undefined>) => {
          if (!value || !data) return '-';
          return value.toFormat();
        },
      },
      {
        headerName: t('AMM_POOLS_TABLE_TH_PRICE_CHANGE'),
        field: 'id',
        colId: 'price-change',
        flex: 1,
        cellDataType: 'number',
        cellRenderer: ({ data }: ICellRendererParams<Market, string>) => {
          if (!data) return '-';
          return <PriceChange market={data} />;
        },
      },
      {
        headerName: t('AMM_POOLS_TABLE_TH_VOLUME'),
        field: 'id',
        colId: 'volume',
        flex: 1,
        cellDataType: 'number',
        cellRenderer: ({ data }: ICellRendererParams<Market, string>) => {
          if (!data) return '-';
          return <CompactVolume24 market={data} />;
        },
      },
      {
        headerName: t('AMM_POOLS_TABLE_TH_MY_LIQUIDITY'),
        field: 'id',
        colId: 'liquidity',
        flex: 1,
        cellDataType: 'number',
        cellRenderer: ({ data }: ICellRendererParams<Market, string>) => {
          if (!data) return '-';
          return <MyLiquidity market={data} />;
        },
      },
      {
        headerName: t('AMM_POOLS_TABLE_TH_ACTIONS'),
        field: 'id',
        colId: 'actions',
        flex: 1,
        sortable: false,
        cellRenderer: ({ value }: ICellRendererParams<Market, string>) => {
          if (!value) return;
          return (
            <Link to={Links.AMM_POOL(value)}>
              <Button intent={Intent.Primary} size="xs">
                {t('AMM_POOLS_TABLE_ACTION_VIEW_DETAILS')}
              </Button>
            </Link>
          );
        },
      },
    ],
    [t]
  );

  let filterSummary: ReactNode = undefined;
  const filteredMarkets = rowData.filter((m) => filterMarket(m, filterTerm));
  if (filteredMarkets.length != rowData.length) {
    const diff = rowData.length - filteredMarkets.length;
    filterSummary = (
      <FilterSummary
        diff={diff}
        resetFilters={() => {
          setFilterTerm('');
        }}
      />
    );
  }

  return (
    <>
      <HeaderPage>{t('AMM_POOLS_TITLE')}</HeaderPage>

      <p className="w-3/5">{t('AMM_POOLS_DESCRIPTION')}</p>

      <div className="flex justify-end">
        <Input
          prependIconName={VegaIconNames.SEARCH}
          placeholder={t('AMM_POOLS_FILTER_PLACEHOLDER')}
          onChange={(event) => {
            const value = trim(event.target.value);
            setFilterTerm(value);
          }}
          value={filterTerm}
        />
      </div>

      <div className="h-full border rounded border-gs-300 dark:border-gs-700">
        <AgGrid
          rowData={rowData}
          domLayout="autoHeight"
          rowClass={
            '!border-b !last:border-b-0 mb-1 border-gs-200 dark:border-gs-800'
          }
          rowHeight={60}
          suppressDragLeaveHidesColumns
          overlayLoadingTemplate={t('AMM_TABLE_LOADING')}
          overlayNoRowsTemplate={t('AMM_TABLE_NO_DATA')}
          isExternalFilterPresent={isExternalFilterPresent}
          doesExternalFilterPass={doesExternalFilterPass}
          pinnedTopRowData={
            filterSummary ? [{ id: 'filter-summary', filterSummary }] : []
          }
          isFullWidthRow={(params) => {
            const data = params.rowNode.data;
            return 'filterSummary' in data;
          }}
          fullWidthCellRenderer={FullWidthCellRenderer}
          columnDefs={columnDefs}
        />
      </div>
    </>
  );
};

const filterMarket = (market: Market, filterTerm: string) => {
  const re = new RegExp(filterTerm, 'ig');
  const code = re.test(market.code);
  const id = re.test(market.id);

  return code || id;
};

const FullWidthCellRenderer = ({ data }: ICellRendererParams) => {
  if ('filterSummary' in data) {
    return <div className="py-4">{data.filterSummary}</div>;
  }
  return null;
};

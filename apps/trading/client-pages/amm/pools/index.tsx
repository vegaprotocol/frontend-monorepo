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
  ValueFormatterParams,
} from 'ag-grid-community';
import filter from 'lodash/filter';
import { t } from '../../../lib/use-t';
import { Links } from '../../../lib/links';
import { AgGrid } from '@vegaprotocol/datagrid';
import { EmblemByMarket } from '@vegaprotocol/emblem';
import { HeaderPage } from '../../../components/header-page';
import { formatNumberPercentage } from '@vegaprotocol/utils';
import BigNumber from 'bignumber.js';
import { PriceChange } from '../../../components/amm/stats/price-change';
import { CompactVolume24 } from '../../../components/amm/stats/volume-24';
import { MyLiquidity } from 'apps/trading/components/amm/stats/my-liquidity';
import { Button, Intent } from '@vegaprotocol/ui-toolkit';

export const Pools = () => {
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

  return (
    <>
      <HeaderPage>{t('AMM_POOLS_TITLE')}</HeaderPage>

      <p className="w-3/5">{t('AMM_POOLS_DESCRIPTION')}</p>

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
          columnDefs={[
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
              valueFormatter: ({
                value,
              }: ValueFormatterParams<Market, number>) =>
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
              }: ValueFormatterParams<
                typeof rowData[0],
                BigNumber | undefined
              >) => {
                if (!value || !data) return '-';
                return value.toFormat(data.positionDecimalPlaces);
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
              cellRenderer: ({
                value,
              }: ICellRendererParams<Market, string>) => {
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
          ]}
        />
      </div>
    </>
  );
};

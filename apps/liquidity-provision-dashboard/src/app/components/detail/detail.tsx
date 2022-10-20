import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { AgGridColumn } from 'ag-grid-react';

import type { GetRowIdParams } from 'ag-grid-community';
import { t } from '@vegaprotocol/react-helpers';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';

import {
  useLiquidityProvision,
  getFeeLevels,
  sumLiquidityCommitted,
} from '@vegaprotocol/liquidity';

import { Market } from './Market';
import { Header } from './header';
import { Grid } from '../grid';

const formatToHours = ({ value }: { value?: string | null }) => {
  if (!value) {
    return '-';
  }

  const MS_IN_HOUR = 1000 * 60 * 60;
  const created = new Date(value).getTime();
  const now = new Date().getTime();
  return `${Math.round(Math.abs(now - created) / MS_IN_HOUR)}h`;
};

const useMarketDetails = (marketId: string | undefined) => {
  const { data, error, loading } = useLiquidityProvision({ marketId });

  return {
    data: {
      ...data,
      feeLevels: getFeeLevels(data.liquidityProviders),
      comittedLiquidity: sumLiquidityCommitted(data.liquidityProviders),
    },
    error,
    loading,
  };
};

export const Detail = () => {
  const { marketId } = useParams<{ marketId: string }>();
  const { data, loading, error } = useMarketDetails(marketId);

  const getRowId = useCallback(({ data }: GetRowIdParams) => data.party, []);

  return (
    <AsyncRenderer loading={loading} error={error} data={data}>
      <div className="px-16 py-20">
        <Header name={data.name} symbol={data.symbol} />

        <Market
          feeLevels={data.feeLevels || []}
          comittedLiquidity={data.comittedLiquidity || 0}
          settlementAsset={{
            symbol: data.symbol,
            decimals: data.decimalPlaces,
          }}
          targetStake={data.targetStake || '0'}
          tradingMode={data.tradingMode}
        />

        <h2 className="font-alpha text-2xl mb-4">
          {t('Current Liquidity Provision')}
        </h2>
        <Grid
          rowData={data.liquidityProviders}
          defaultColDef={{
            resizable: true,
            sortable: true,
            unSortIcon: true,
            cellClass: ['flex', 'flex-col', 'justify-center'],
          }}
          getRowId={getRowId}
          rowHeight={92}
        >
          <AgGridColumn
            headerName={t('LPs')}
            field="party"
            flex="1"
            minWidth={100}
          />
          <AgGridColumn
            headerName={t('Time in market')}
            valueFormatter={formatToHours}
            field="createdAt"
          />
          <AgGridColumn headerName={t('Galps')} field="Galps" />
          <AgGridColumn
            headerName={t('committed bond/stake')}
            field="commitmentAmount"
          />
          <AgGridColumn headerName={t('Margin Req.')} field="margin" />
          <AgGridColumn headerName={t('24h Fees')} field="fees" />
          <AgGridColumn headerName={t('Fee level')} field="fee" />

          <AgGridColumn headerName={t('APY')} field="apy" />
        </Grid>
      </div>
    </AsyncRenderer>
  );
};

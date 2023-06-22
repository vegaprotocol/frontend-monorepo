import { useDataProvider } from '@vegaprotocol/data-provider';
import { useDataGridEvents } from '@vegaprotocol/datagrid';
import { t } from '@vegaprotocol/i18n';
import {
  lpAggregatedDataProvider,
  type Filter,
  LiquidityTable,
  liquidityProvisionsDataProvider,
} from '@vegaprotocol/liquidity';
import { useMarket } from '@vegaprotocol/markets';
import {
  NetworkParams,
  useNetworkParams,
} from '@vegaprotocol/network-parameters';
import type { AgGridReact } from 'ag-grid-react';
import type { DataGridSlice } from '../../stores/datagrid-store-slice';
import { createDataGridSlice } from '../../stores/datagrid-store-slice';
import { useEffect, useRef } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const LiquidityContainer = ({
  marketId,
  filter,
}: {
  marketId: string | undefined;
  filter?: Filter;
}) => {
  const gridRef = useRef<AgGridReact | null>(null);

  const gridStore = useLiquidityStore((store) => store.gridStore);
  const updateGridStore = useLiquidityStore((store) => store.updateGridStore);

  const gridStoreCallbacks = useDataGridEvents(gridStore, (colState) => {
    updateGridStore(colState);
  });
  const { data: market } = useMarket(marketId);

  // To be removed when liquidityProvision subscriptions are working
  useReloadLiquidityData(marketId);

  const { data, error } = useDataProvider({
    dataProvider: lpAggregatedDataProvider,
    variables: { marketId: marketId || '', filter },
    skip: !marketId,
  });

  const assetDecimalPlaces =
    market?.tradableInstrument.instrument.product.settlementAsset.decimals || 0;
  const quantum =
    market?.tradableInstrument.instrument.product.settlementAsset.quantum || 0;
  const symbol =
    market?.tradableInstrument.instrument.product.settlementAsset.symbol;

  const { params } = useNetworkParams([
    NetworkParams.market_liquidity_stakeToCcyVolume,
  ]);
  const stakeToCcyVolume = params.market_liquidity_stakeToCcyVolume;

  return (
    <div className="h-full relative">
      <LiquidityTable
        ref={gridRef}
        rowData={data}
        symbol={symbol}
        assetDecimalPlaces={assetDecimalPlaces}
        quantum={quantum}
        stakeToCcyVolume={stakeToCcyVolume}
        overlayNoRowsTemplate={error ? error.message : t('No data')}
        {...gridStoreCallbacks}
      />
    </div>
  );
};

const useReloadLiquidityData = (marketId: string | undefined) => {
  const { reload } = useDataProvider({
    dataProvider: liquidityProvisionsDataProvider,
    variables: { marketId: marketId || '' },
    update: () => true,
    skip: !marketId,
  });
  useEffect(() => {
    const interval = setInterval(reload, 30000);
    return () => clearInterval(interval);
  }, [reload]);
};

const useLiquidityStore = create<DataGridSlice>()(
  persist(
    (...args) => ({
      ...createDataGridSlice(...args),
    }),
    {
      name: 'vega_ledger_store',
    }
  )
);

import compact from 'lodash/compact';
import { isAfter } from 'date-fns';
import type {
  VegaICellRendererParams,
  VegaValueFormatterParams,
} from '@vegaprotocol/datagrid';
import { GridNowRowsOverlay } from '@vegaprotocol/datagrid';
import { AgGridLazy as AgGrid, COL_DEFS } from '@vegaprotocol/datagrid';
import { useMemo } from 'react';
import { t } from '@vegaprotocol/i18n';
import { MarketState, MarketStateMapping } from '@vegaprotocol/types';
import {
  addDecimalsFormatNumber,
  getMarketExpiryDate,
} from '@vegaprotocol/utils';
import { usePositionsQuery } from '@vegaprotocol/positions';
import type {
  DataSourceFilterFragment,
  MarketMaybeWithData,
} from '@vegaprotocol/markets';
import {
  MarketTableActions,
  closedMarketsWithDataProvider,
} from '@vegaprotocol/markets';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';
import type { ColDef } from 'ag-grid-community';
import { SettlementDateCell } from './settlement-date-cell';
import { SettlementPriceCell } from './settlement-price-cell';
import { useDataProvider } from '@vegaprotocol/data-provider';

type SettlementAsset =
  MarketMaybeWithData['tradableInstrument']['instrument']['product']['settlementAsset'];

interface Row {
  id: string;
  code: string;
  name: string;
  decimalPlaces: number;
  state: MarketState;
  metadata: string[];
  closeTimestamp: string | null;
  bestBidPrice: string | undefined;
  bestOfferPrice: string | undefined;
  markPrice: string | undefined;
  settlementDataOracleId: string;
  settlementDataSpecBinding: string;
  setlementDataSourceFilter: DataSourceFilterFragment | undefined;
  tradingTerminationOracleId: string;
  settlementAsset: SettlementAsset;
  realisedPNL: string | undefined;
}

export const Closed = () => {
  const { pubKey } = useVegaWallet();
  const {
    data: marketData,
    error,
    reload,
  } = useDataProvider({
    dataProvider: closedMarketsWithDataProvider,
    variables: undefined,
  });
  const { data: positionData } = usePositionsQuery({
    variables: {
      partyIds: pubKey ? [pubKey] : [],
    },
    skip: !pubKey,
  });

  // find a position for each market and add the realised pnl to
  // a normalized object
  const rowData = compact(marketData).map((market) => {
    const position = positionData?.positions?.edges?.find((edge) => {
      return edge.node.market.id === market.id;
    });

    const instrument = market.tradableInstrument.instrument;

    const spec =
      instrument.product.dataSourceSpecForSettlementData.data.sourceType
        .__typename === 'DataSourceDefinitionExternal'
        ? instrument.product.dataSourceSpecForSettlementData.data.sourceType
            .sourceType
        : undefined;
    const filters = spec?.filters || [];

    const settlementDataSpecBinding =
      instrument.product.dataSourceSpecBinding.settlementDataProperty;
    const filter = filters?.find((filter) => {
      return filter.key.name === settlementDataSpecBinding;
    });

    const row: Row = {
      id: market.id,
      code: instrument.code,
      name: instrument.name,
      decimalPlaces: market.decimalPlaces,
      state: market.state,
      metadata: instrument.metadata.tags ?? [],
      closeTimestamp: market.marketTimestamps.close,
      bestBidPrice: market.data?.bestBidPrice,
      bestOfferPrice: market.data?.bestOfferPrice,
      markPrice: market.data?.markPrice,
      settlementDataOracleId:
        instrument.product.dataSourceSpecForSettlementData.id,
      settlementDataSpecBinding,
      setlementDataSourceFilter: filter,
      tradingTerminationOracleId:
        instrument.product.dataSourceSpecForTradingTermination.id,
      settlementAsset: instrument.product.settlementAsset,
      realisedPNL: position?.node.realisedPNL,
    };

    return row;
  });
  return (
    <div className="h-full relative">
      <ClosedMarketsDataGrid rowData={rowData} error={error} reload={reload} />
    </div>
  );
};

const ClosedMarketsDataGrid = ({
  rowData,
  error,
  reload,
}: {
  rowData: Row[];
  error: Error | undefined;
  reload: () => void;
}) => {
  const openAssetDialog = useAssetDetailsDialogStore((store) => store.open);
  const colDefs = useMemo(() => {
    const cols: ColDef[] = [
      {
        headerName: t('Market'),
        field: 'code',
        cellRenderer: ({
          value,
          data,
        }: VegaICellRendererParams<Row, 'code'>) => {
          return (
            <span data-testid="market-code" data-market-id={data?.id}>
              {value}
            </span>
          );
        },
      },
      {
        headerName: t('Description'),
        field: 'name',
      },
      {
        headerName: t('Status'),
        field: 'state',
        valueFormatter: ({ value }: VegaValueFormatterParams<Row, 'state'>) => {
          if (!value) return '-';
          return MarketStateMapping[value];
        },
      },
      {
        headerName: t('Settlement date'),
        colId: 'settlementDate', // colId needed if no field property provided otherwise column order is ruined in tests
        valueGetter: ({ data }: { data: Row }) => {
          return getMarketExpiryDate(data.metadata);
        },
        cellRenderer: ({ value, data }: { value: Date | null; data: Row }) => {
          return (
            <SettlementDateCell
              oracleSpecId={data.tradingTerminationOracleId}
              metaDate={value}
              marketState={data.state}
              closeTimestamp={data.closeTimestamp}
            />
          );
        },
        cellClassRules: {
          'text-danger': ({
            value,
            data,
          }: {
            value: Date | null;
            data: Row;
          }) => {
            const date = data.closeTimestamp
              ? new Date(data.closeTimestamp)
              : value;

            if (!date) return false;

            if (
              // expiry has passed and market is not yet settled
              isAfter(new Date(), date) &&
              data.state !== MarketState.STATE_SETTLED
            ) {
              return true;
            }
            return false;
          },
        },
      },
      {
        headerName: t('Best bid'),
        field: 'bestBidPrice',
        type: 'numericColumn',
        cellClass: 'font-mono ag-right-aligned-cell',
        valueFormatter: ({
          value,
          data,
        }: VegaValueFormatterParams<Row, 'bestBidPrice'>) => {
          if (!value || !data) return '-';
          return addDecimalsFormatNumber(value, data.decimalPlaces);
        },
      },
      {
        headerName: t('Best offer'),
        field: 'bestOfferPrice',
        cellClass: 'font-mono ag-right-aligned-cell',
        type: 'numericColumn',
        valueFormatter: ({
          value,
          data,
        }: VegaValueFormatterParams<Row, 'bestOfferPrice'>) => {
          if (!value || !data) return '-';
          return addDecimalsFormatNumber(value, data.decimalPlaces);
        },
      },
      {
        headerName: t('Mark price'),
        field: 'markPrice',
        cellClass: 'font-mono ag-right-aligned-cell',
        type: 'numericColumn',
        valueFormatter: ({
          value,
          data,
        }: VegaValueFormatterParams<Row, 'markPrice'>) => {
          if (!value || !data) return '-';
          return addDecimalsFormatNumber(value, data.decimalPlaces);
        },
      },
      {
        headerName: t('Settlement price'),
        type: 'numericColumn',
        field: 'settlementDataOracleId',
        // 'tradableInstrument.instrument.product.dataSourceSpecForSettlementData.id',
        cellRenderer: ({
          value,
          data,
        }: VegaICellRendererParams<Row, 'settlementDataOracleId'>) => (
          <SettlementPriceCell
            oracleSpecId={value}
            settlementDataSpecBinding={data?.settlementDataSpecBinding}
            filter={data?.setlementDataSourceFilter}
          />
        ),
      },
      {
        headerName: t('Realised PNL'),
        field: 'realisedPNL',
        cellClass: 'font-mono ag-right-aligned-cell',
        type: 'numericColumn',
        valueFormatter: ({
          value,
          data,
        }: VegaValueFormatterParams<Row, 'realisedPNL'>) => {
          if (!value || !data) return '-';
          return addDecimalsFormatNumber(value, data.decimalPlaces);
        },
      },
      {
        headerName: t('Settlement asset'),
        field: 'settlementAsset',
        cellRenderer: ({
          value,
          data,
        }: VegaValueFormatterParams<Row, 'settlementAsset'>) => (
          <button
            className="underline"
            onClick={() => {
              if (!value) return;
              openAssetDialog(value.id);
            }}
          >
            {value ? value.symbol : '-'}
          </button>
        ),
      },
      {
        colId: 'market-actions',
        ...COL_DEFS.actions,
        cellRenderer: ({ data }: VegaICellRendererParams<Row>) => {
          if (!data) return null;
          return (
            <MarketTableActions
              marketId={data.id}
              assetId={data.settlementAsset.id}
            />
          );
        },
      },
    ];
    return cols;
  }, [openAssetDialog]);

  return (
    <AgGrid
      style={{ width: '100%', height: '100%' }}
      rowData={rowData}
      columnDefs={colDefs}
      getRowId={({ data }) => data.id}
      defaultColDef={{
        resizable: true,
        minWidth: 100,
      }}
      noRowsOverlayComponent={() => (
        <GridNowRowsOverlay
          message={t('No markets')}
          error={error}
          reload={reload}
        />
      )}
      storeKey="closedMarkets"
    />
  );
};

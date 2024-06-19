import type { CellClickedEvent } from 'ag-grid-community';
import compact from 'lodash/compact';
import { isAfter } from 'date-fns';
import type { VegaValueFormatterParams } from '@vegaprotocol/datagrid';
import {
  AgGrid,
  COL_DEFS,
  MarketProductPill,
  StackedCell,
} from '@vegaprotocol/datagrid';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { useMemo } from 'react';
import type { Asset } from '@vegaprotocol/types';
import type { ProductType } from '@vegaprotocol/types';
import { MarketState, MarketStateMapping } from '@vegaprotocol/types';
import {
  addDecimalsFormatNumber,
  getMarketExpiryDate,
} from '@vegaprotocol/utils';
import { closedMarketsProvider, getAsset } from '@vegaprotocol/markets';
import type { DataSourceFilterFragment } from '@vegaprotocol/markets';
import { useMarketClickHandler } from '../../lib/hooks/use-market-click-handler';
import { SettlementDateCell } from './settlement-date-cell';
import { useT } from '../../lib/use-t';
import { EmblemByMarket } from '@vegaprotocol/emblem';
import { useChainId } from '@vegaprotocol/wallet-react';

type SettlementAsset = Pick<
  Asset,
  'decimals' | 'name' | 'quantum' | 'id' | 'symbol'
>;

interface Row {
  id: string;
  code: string;
  name: string;
  decimalPlaces: number;
  state?: MarketState;
  metadata: string[];
  closeTimestamp: string | null;
  bestBidPrice: string | undefined;
  bestOfferPrice: string | undefined;
  markPrice: string | undefined;
  settlementDataOracleId: string;
  settlementDataSpecBinding: string;
  settlementDataSourceFilter: DataSourceFilterFragment | undefined;
  tradingTerminationOracleId: string;
  settlementAsset: SettlementAsset;
  productType: ProductType | undefined;
  successorMarketID: string | null | undefined;
  parentMarketID: string | null | undefined;
}

export const Closed = () => {
  const { data: marketData, error } = useDataProvider({
    dataProvider: closedMarketsProvider,
    variables: undefined,
  });

  const rowData = compact(marketData).map((market) => {
    const instrument = market.tradableInstrument.instrument;

    const spec =
      (instrument.product.__typename === 'Future' ||
        instrument.product.__typename === 'Perpetual') &&
      instrument.product.dataSourceSpecForSettlementData.data.sourceType
        .__typename === 'DataSourceDefinitionExternal'
        ? instrument.product.dataSourceSpecForSettlementData.data.sourceType
            .sourceType
        : undefined;
    const filters = (spec && 'filters' in spec && spec.filters) || [];

    const settlementDataSpecBinding =
      instrument.product.__typename === 'Future' ||
      instrument.product.__typename === 'Perpetual'
        ? instrument.product.dataSourceSpecBinding.settlementDataProperty
        : '';
    const filter =
      filters && Array.isArray(filters)
        ? filters?.find((filter) => {
            return filter.key.name === settlementDataSpecBinding;
          })
        : undefined;

    const row: Row = {
      id: market.id,
      code: instrument.code,
      name: instrument.name,
      decimalPlaces: market.decimalPlaces,
      state: market.data?.marketState,
      metadata: instrument.metadata.tags ?? [],
      closeTimestamp: market.marketTimestamps.close,
      bestBidPrice: market.data?.bestBidPrice,
      bestOfferPrice: market.data?.bestOfferPrice,
      markPrice: market.data?.markPrice,
      settlementDataOracleId:
        instrument.product.__typename === 'Future' ||
        instrument.product.__typename === 'Perpetual'
          ? instrument.product.dataSourceSpecForSettlementData.id
          : '',
      settlementDataSpecBinding,
      settlementDataSourceFilter: filter,
      tradingTerminationOracleId:
        instrument.product.__typename === 'Future'
          ? instrument.product.dataSourceSpecForTradingTermination.id
          : '',
      settlementAsset: getAsset({ tradableInstrument: { instrument } }),
      productType: instrument.product.__typename,
      successorMarketID: market.successorMarketID,
      parentMarketID: market.parentMarketID,
    };

    return row;
  });

  return <ClosedMarketsDataGrid rowData={rowData} error={error} />;
};

const ClosedMarketsDataGrid = ({
  rowData,
  error,
}: {
  rowData: Row[];
  error: Error | undefined;
}) => {
  const t = useT();
  const handleOnSelect = useMarketClickHandler();
  const { chainId } = useChainId();

  const colDefs = useMemo(() => {
    return [
      {
        headerName: t('Market'),
        field: 'code',
        minWidth: 250,
        cellRenderer: ({
          value,
          data,
        }: {
          value: string | undefined; // market code
          data: {
            id: string;
            productType: ProductType | undefined;
            parentMarketID: string | null | undefined;
            successorMarketID?: string | null | undefined;
            name: string;
          };
        }) => {
          const productType = data?.productType;
          return (
            <span className="flex items-center gap-2 cursor-pointer">
              <EmblemByMarket market={data.id} vegaChain={chainId} />
              <StackedCell
                primary={
                  <span className="flex gap-1 items-center">
                    {value}
                    <MarketProductPill productType={productType} />
                  </span>
                }
                secondary={data.name}
              />
            </span>
          );
        },
        resizable: true,
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
        headerName: t('Price'),
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
    ];
  }, [chainId, t]);

  return (
    <AgGrid
      rowData={rowData}
      defaultColDef={COL_DEFS.default}
      columnDefs={colDefs}
      domLayout="autoHeight"
      getRowId={({ data }) => data.id}
      overlayNoRowsTemplate={error ? error.message : t('No markets')}
      rowHeight={60}
      headerHeight={40}
      autoSizeStrategy={{
        type: 'fitGridWidth',
      }}
      onCellClicked={({ data, column, event }: CellClickedEvent<Row>) => {
        if (!data) return;

        // prevent navigating to the market page if any of the below cells are clicked
        // event.preventDefault or event.stopPropagation don't seem to apply for ag-gird
        const colId = column.getColId();

        if (
          [
            'settlementDate',
            'settlementDataOracleId',
            'settlementAsset',
            'market-actions',
          ].includes(colId)
        ) {
          return;
        }

        handleOnSelect(
          data.id,
          // @ts-ignore metaKey exists
          event ? event.metaKey : false
        );
      }}
    />
  );
};

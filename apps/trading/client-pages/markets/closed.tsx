import compact from 'lodash/compact';
import { isAfter } from 'date-fns';
import type {
  VegaICellRendererParams,
  VegaValueFormatterParams,
} from '@vegaprotocol/datagrid';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/datagrid';
import { useMemo } from 'react';
import { t } from '@vegaprotocol/i18n';
import { MarketState, MarketStateMapping } from '@vegaprotocol/types';
import {
  addDecimalsFormatNumber,
  getMarketExpiryDate,
} from '@vegaprotocol/utils';
import { usePositionsQuery } from '@vegaprotocol/positions';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';
import type { ColDef } from 'ag-grid-community';
import type { ClosedMarketFragment } from './__generated__/ClosedMarkets';
import { useClosedMarketsQuery } from './__generated__/ClosedMarkets';
import { SettlementDateCell } from './settlement-date-cell';
import { SettlementPriceCell } from './settlement-price-cell';

type Row = ClosedMarketFragment & {
  realisedPNL: string | undefined;
};

export const Closed = () => {
  const { pubKey } = useVegaWallet();
  const { data: marketData } = useClosedMarketsQuery();
  const { data: positionData } = usePositionsQuery({
    variables: {
      partyId: pubKey || '',
    },
    skip: !pubKey,
  });

  const rowData = compact(marketData?.marketsConnection?.edges)
    .map((edge) => edge.node)
    .map((market) => {
      const position = positionData?.party?.positionsConnection?.edges?.find(
        (edge) => {
          return edge.node.market.id === market.id;
        }
      );

      return {
        ...market,
        realisedPNL: position?.node.realisedPNL,
      };
    })
    .filter((m) => {
      return [
        MarketState.STATE_SETTLED,
        MarketState.STATE_TRADING_TERMINATED,
      ].includes(m.state);
    });

  return <ClosedMarketsDataGrid rowData={rowData} />;
};

const ClosedMarketsDataGrid = ({ rowData }: { rowData: Row[] }) => {
  const openAssetDialog = useAssetDetailsDialogStore((store) => store.open);
  const colDefs = useMemo(() => {
    const cols: ColDef[] = [
      {
        headerName: t('Market'),
        field: 'tradableInstrument.instrument.code',
      },
      {
        headerName: t('Description'),
        field: 'tradableInstrument.instrument.name',
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
        valueGetter: ({ data }) => {
          return getMarketExpiryDate(
            data?.tradableInstrument.instrument.metadata.tags
          );
        },
        cellRenderer: ({ value, data }: { value: Date | null; data: Row }) => {
          return (
            <SettlementDateCell
              oracleSpecId={
                data.tradableInstrument.instrument.product
                  .dataSourceSpecForTradingTermination.id
              }
              metaDate={value}
              marketState={data.state}
              closeTimestamp={data.marketTimestamps.close}
            />
          );
        },
        cellClassRules: {
          'text-danger': ({ value, data }) => {
            const date = data.marketTimestamps.close
              ? new Date(data.marketTimestamps.close)
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
        field: 'data.bestBidPrice',
        type: 'numericColumn',
        cellClass: 'font-mono ag-right-aligned-cell',
        valueFormatter: ({
          value,
          data,
        }: VegaValueFormatterParams<Row, 'data.bestBidPrice'>) => {
          if (!value || !data) return '-';
          return addDecimalsFormatNumber(value, data.decimalPlaces);
        },
      },
      {
        headerName: t('Best offer'),
        field: 'data.bestOfferPrice',
        cellClass: 'font-mono ag-right-aligned-cell',
        type: 'numericColumn',
        valueFormatter: ({
          value,
          data,
        }: VegaValueFormatterParams<Row, 'data.bestOfferPrice'>) => {
          if (!value || !data) return '-';
          return addDecimalsFormatNumber(value, data.decimalPlaces);
        },
      },
      {
        headerName: t('Mark price'),
        field: 'data.markPrice',
        cellClass: 'font-mono ag-right-aligned-cell',
        type: 'numericColumn',
        valueFormatter: ({
          value,
          data,
        }: VegaValueFormatterParams<Row, 'data.markPrice'>) => {
          if (!value || !data) return '-';
          return addDecimalsFormatNumber(value, data.decimalPlaces);
        },
      },
      {
        headerName: t('Settlement price'),
        type: 'numericColumn',
        field:
          'tradableInstrument.instrument.product.dataSourceSpecForSettlementData.id',
        cellRenderer: ({
          value,
          data,
        }: VegaICellRendererParams<
          Row,
          'tradableInstrument.instrument.product.dataSourceSpecForSettlementData.id'
        >) => (
          <SettlementPriceCell
            oracleSpecId={value}
            decimalPlaces={data?.decimalPlaces ?? 0}
            settlementDataSpecBinding={
              data?.tradableInstrument.instrument.product.dataSourceSpecBinding
                .settlementDataProperty
            }
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
        field: 'tradableInstrument.instrument.product.settlementAsset.symbol',
        cellRenderer: ({
          value,
          data,
        }: VegaValueFormatterParams<
          Row,
          'tradableInstrument.instrument.product.settlementAsset.symbol'
        >) => (
          <button
            className="underline"
            onClick={() => {
              const assetId =
                data?.tradableInstrument.instrument.product.settlementAsset.id;
              if (!assetId) return;
              openAssetDialog(assetId);
            }}
          >
            {value}
          </button>
        ),
      },
      {
        headerName: t('Market ID'),
        field: 'id',
      },
    ];
    return cols;
  }, [openAssetDialog]);

  return (
    <AgGrid
      style={{ width: '100%', height: '100%' }}
      rowData={rowData}
      columnDefs={colDefs}
      defaultColDef={{
        flex: 1,
        resizable: true,
      }}
      overlayNoRowsTemplate="No data"
    />
  );
};

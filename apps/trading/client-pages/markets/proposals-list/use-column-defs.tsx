import { useMemo } from 'react';
import type { ColDef } from 'ag-grid-community';
import {
  COL_DEFS,
  DateRangeFilter,
  SetFilter,
  StackedCell,
} from '@vegaprotocol/datagrid';
import compact from 'lodash/compact';
import { getDateTimeFormat } from '@vegaprotocol/utils';
import type {
  VegaICellRendererParams,
  VegaValueFormatterParams,
} from '@vegaprotocol/datagrid';
import {
  MarketStateMapping,
  ProductTypeMapping,
  ProductTypeShortName,
} from '@vegaprotocol/types';
import { ProposalActionsDropdown } from './proposal-actions-dropdown';
import {
  type MarketMaybeWithData,
  getProductType,
} from '@vegaprotocol/markets';
import { useT } from '../../../lib/use-t';

export const useColumnDefs = () => {
  const t = useT();

  const columnDefs: ColDef[] = useMemo(() => {
    return compact([
      {
        colId: 'market',
        headerName: t('Market'),
        field: 'tradableInstrument.instrument.code',
        pinned: true,
        cellStyle: { lineHeight: '14px' },
        cellRenderer: ({
          value,
          data,
        }: {
          value: string;
          data: MarketMaybeWithData;
        }) => {
          if (!value || !data) return '-';

          const productType = getProductType(data);
          return (
            productType && (
              <StackedCell
                primary={value}
                secondary={
                  <span
                    title={ProductTypeMapping[productType]}
                    className="uppercase"
                  >
                    {ProductTypeShortName[productType]}
                  </span>
                }
              />
            )
          );
        },
      },
      {
        colId: 'asset',
        headerName: t('Settlement asset'),
        field: 'tradableInstrument.instrument.product.settlementAsset.symbol',
      },
      {
        colId: 'state',
        headerName: t('State'),
        field: 'data.marketState',
        valueFormatter: ({
          value,
        }: VegaValueFormatterParams<
          MarketMaybeWithData,
          'data.marketState'
        >) => {
          return value ? MarketStateMapping[value] : '-';
        },
        filter: SetFilter,
        filterParams: {
          set: MarketStateMapping,
        },
      },
      {
        headerName: t('Parent market'),
        field: 'parentMarketID',
        cellRenderer: 'ParentMarketCell',
      },
      {
        colId: 'closing-date',
        headerName: t('Closing date'),
        field: 'marketTimestamps.pending',
        valueFormatter: ({
          value,
        }: VegaValueFormatterParams<
          MarketMaybeWithData,
          'marketTimestamps.pending'
        >) => {
          return value ? getDateTimeFormat().format(new Date(value)) : '-';
        },
        filter: DateRangeFilter,
      },
      {
        colId: 'enactment-date',
        headerName: t('Enactment date'),
        field: 'marketTimestamps.open',
        valueFormatter: ({
          value,
        }: VegaValueFormatterParams<
          MarketMaybeWithData,
          'marketTimestamps.open'
        >) => (value ? getDateTimeFormat().format(new Date(value)) : '-'),
        filter: DateRangeFilter,
      },
      {
        colId: 'proposal-actions',
        ...COL_DEFS.actions,
        cellRenderer: ({
          data,
        }: VegaICellRendererParams<MarketMaybeWithData>) => {
          if (!data?.marketProposal?.id) return null;

          return <ProposalActionsDropdown id={data.marketProposal.id} />;
        },
      },
    ]);
  }, [t]);

  return columnDefs;
};

import { forwardRef, useMemo } from 'react';
import {
  addDecimalsFormatNumber,
  addDecimalsFormatNumberQuantum,
} from '@vegaprotocol/utils';
import { useT } from './use-t';
import { Intent, TooltipCellComponent } from '@vegaprotocol/ui-toolkit';
import { type AgGridReact, type AgGridReactProps } from 'ag-grid-react';
import { type AccountFields } from './accounts-data-provider';
import { AccountTypeMapping } from '@vegaprotocol/types';
import {
  type VegaValueFormatterParams,
  type VegaICellRendererParams,
} from '@vegaprotocol/datagrid';
import { ProgressBarCell } from '@vegaprotocol/datagrid';
import { AgGrid, PriceCell } from '@vegaprotocol/datagrid';
import type { ColDef } from 'ag-grid-community';
import { accountValuesComparator } from './accounts-table';
import { MarketNameCell } from '@vegaprotocol/datagrid';

const defaultColDef = {
  resizable: true,
  sortable: true,
  minWidth: 100,
};

interface BreakdownTableProps extends AgGridReactProps {
  data: AccountFields[] | null;
  onMarketClick?: (marketId: string, metaKey?: boolean) => void;
}

const BreakdownTable = forwardRef<AgGridReact, BreakdownTableProps>(
  ({ data }, ref) => {
    const t = useT();
    const colDefs = useMemo(() => {
      const defs: ColDef[] = [
        {
          headerName: t('Market'),
          field: 'market.tradableInstrument.instrument.code',
          width: 90,
          pinned: true,
          sort: 'desc',
          cellRenderer: ({
            value,
            data,
          }: VegaICellRendererParams<
            AccountFields,
            'market.tradableInstrument.instrument.code'
          >) => {
            return value ? (
              <MarketNameCell
                value={value}
                productType={
                  data?.market?.tradableInstrument.instrument.product.__typename
                }
              />
            ) : (
              t('None')
            );
          },
        },
        {
          headerName: t('Account type'),
          field: 'type',
          maxWidth: 300,
          valueFormatter: ({
            value,
          }: VegaValueFormatterParams<AccountFields, 'type'>) => {
            return value
              ? AccountTypeMapping[value as keyof typeof AccountTypeMapping]
              : '';
          },
        },
        {
          headerName: t('Balance'),
          field: 'used',
          maxWidth: 500,
          type: 'rightAligned',
          tooltipComponent: TooltipCellComponent,
          tooltipValueGetter: ({ value, data }) => {
            return addDecimalsFormatNumber(value, data.asset.decimals);
          },
          cellRenderer: ({
            data,
            node,
          }: VegaICellRendererParams<AccountFields, 'used'>) => {
            if (!data || node?.rowPinned) {
              return undefined;
            }
            const min = BigInt(data.used);
            const mid = BigInt(data.available);
            const max = BigInt(data.total);
            const range = max > min ? max : min;
            const formattedData = {
              low: addDecimalsFormatNumberQuantum(
                min.toString(),
                data.asset.decimals,
                data.asset.quantum
              ),
              high: addDecimalsFormatNumberQuantum(
                mid.toString(),
                data.asset.decimals,
                data.asset.quantum
              ),
              value: range ? Number((min * BigInt(100)) / range) : 0,
              intent: Intent.Warning,
            };
            return <ProgressBarCell valueFormatted={formattedData} />;
          },
          comparator: accountValuesComparator,
        },
      ];
      return defs;
    }, [t]);

    return (
      <AgGrid
        overlayNoRowsTemplate={t('Collateral not used')}
        rowData={data}
        getRowId={({ data }: { data: AccountFields }) =>
          `${data.asset.id}:${data.type}:${data.market?.id}`
        }
        ref={ref}
        rowHeight={34}
        components={{ PriceCell, ProgressBarCell }}
        tooltipShowDelay={500}
        defaultColDef={defaultColDef}
        columnDefs={colDefs}
        domLayout="autoHeight"
      />
    );
  }
);

export default BreakdownTable;

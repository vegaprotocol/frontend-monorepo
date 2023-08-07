import { forwardRef, useMemo } from 'react';
import {
  addDecimalsFormatNumber,
  addDecimalsFormatNumberQuantum,
} from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { Intent, TooltipCellComponent } from '@vegaprotocol/ui-toolkit';
import type { AgGridReact, AgGridReactProps } from 'ag-grid-react';
import type { AccountFields } from './accounts-data-provider';
import { AccountTypeMapping } from '@vegaprotocol/types';
import type {
  VegaValueFormatterParams,
  VegaICellRendererParams,
} from '@vegaprotocol/datagrid';
import { ProgressBarCell } from '@vegaprotocol/datagrid';
import { AgGridLazy as AgGrid, PriceCell } from '@vegaprotocol/datagrid';
import type { ColDef } from 'ag-grid-community';
import { accountValuesComparator } from './accounts-table';
import { MarginHealthChart } from './margin-health-chart';
import { MarketNameCell } from '@vegaprotocol/datagrid';
import { AccountType } from '@vegaprotocol/types';

interface BreakdownTableProps extends AgGridReactProps {
  data: AccountFields[] | null;
  onMarketClick?: (marketId: string, metaKey?: boolean) => void;
}

const BreakdownTable = forwardRef<AgGridReact, BreakdownTableProps>(
  ({ data }, ref) => {
    const coldefs = useMemo(() => {
      const defs: ColDef[] = [
        {
          headerName: t('Market'),
          field: 'market.tradableInstrument.instrument.code',
          valueFormatter: ({
            value,
          }: VegaValueFormatterParams<
            AccountFields,
            'market.tradableInstrument.instrument.code'
          >) => {
            if (!value) return 'None';
            return value;
          },
          minWidth: 200,
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
        {
          headerName: t('Margin health'),
          field: 'market.id',
          maxWidth: 500,
          sortable: false,
          cellRenderer: ({
            data,
          }: VegaICellRendererParams<AccountFields, 'market.id'>) =>
            data?.market?.id &&
            data.type === AccountType['ACCOUNT_TYPE_MARGIN'] &&
            data?.asset.id ? (
              <MarginHealthChart
                marketId={data.market.id}
                assetId={data.asset.id}
              />
            ) : null,
        },
      ];
      return defs;
    }, []);

    return (
      <AgGrid
        overlayNoRowsTemplate={t('Collateral not used')}
        rowData={data}
        getRowId={({ data }: { data: AccountFields }) =>
          `${data.asset.id}:${data.type}:${data.market?.id}`
        }
        ref={ref}
        rowHeight={34}
        components={{ PriceCell, MarketNameCell, ProgressBarCell }}
        tooltipShowDelay={500}
        defaultColDef={{
          sortable: true,
        }}
        columnDefs={coldefs}
      />
    );
  }
);

export default BreakdownTable;

import { forwardRef } from 'react';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { Intent } from '@vegaprotocol/ui-toolkit';
import { AgGridColumn } from 'ag-grid-react';
import type { AgGridReact, AgGridReactProps } from 'ag-grid-react';
import type { AccountFields } from './accounts-data-provider';
import { AccountTypeMapping } from '@vegaprotocol/types';
import type {
  ValueProps,
  VegaValueFormatterParams,
  VegaICellRendererParams,
} from '@vegaprotocol/datagrid';
import { ProgressBarCell } from '@vegaprotocol/datagrid';
import { AgGridLazy as AgGrid, PriceCell } from '@vegaprotocol/datagrid';
import type { ValueFormatterParams } from 'ag-grid-community';
import { accountValuesComparator } from './accounts-table';
import { MarginHealthChart } from './margin-health-chart';
import { MarketNameCell } from '@vegaprotocol/datagrid';
import { AccountType } from '@vegaprotocol/types';

export const progressBarValueFormatter = ({
  data,
  node,
}: ValueFormatterParams): ValueProps['valueFormatted'] | undefined => {
  if (!data || node?.rowPinned) {
    return undefined;
  }
  const min = BigInt(data.used);
  const mid = BigInt(data.available);
  const max = BigInt(data.total);
  const range = max > min ? max : min;
  return {
    low: addDecimalsFormatNumber(min.toString(), data.asset.decimals),
    high: addDecimalsFormatNumber(mid.toString(), data.asset.decimals),
    value: range ? Number((min * BigInt(100)) / range) : 0,
    intent: Intent.Warning,
  };
};

interface BreakdownTableProps extends AgGridReactProps {
  data: AccountFields[] | null;
  onMarketClick?: (marketId: string, metaKey?: boolean) => void;
}

const BreakdownTable = forwardRef<AgGridReact, BreakdownTableProps>(
  ({ data, onMarketClick }, ref) => {
    return (
      <AgGrid
        style={{ width: '100%', height: '100%' }}
        overlayNoRowsTemplate={t('Collateral not used')}
        rowData={data}
        getRowId={({ data }: { data: AccountFields }) =>
          `${data.asset.id}-${data.type}-${data.market?.id}`
        }
        ref={ref}
        rowHeight={34}
        components={{ PriceCell, MarketNameCell, ProgressBarCell }}
        tooltipShowDelay={500}
        defaultColDef={{
          flex: 1,
          resizable: true,
          sortable: true,
        }}
      >
        <AgGridColumn
          headerName={t('Market')}
          field="market.tradableInstrument.instrument.name"
          cellRendererParams={{
            onMarketClick,
            defaultValue: t('None'),
            idPath: 'market.id',
          }}
          cellRenderer="MarketNameCell"
          minWidth={200}
        />
        <AgGridColumn
          headerName={t('Account type')}
          field="type"
          width={100}
          valueFormatter={({
            value,
          }: VegaValueFormatterParams<AccountFields, 'type'>) =>
            value
              ? AccountTypeMapping[value as keyof typeof AccountTypeMapping]
              : ''
          }
        />

        <AgGridColumn
          headerName={t('Balance')}
          field="used"
          flex={2}
          maxWidth={500}
          cellRenderer="ProgressBarCell"
          valueFormatter={progressBarValueFormatter}
          comparator={accountValuesComparator}
        />
        <AgGridColumn
          headerName={t('Margin health')}
          field="market.id"
          flex={2}
          maxWidth={500}
          sortable={false}
          cellRenderer={({
            data,
          }: VegaICellRendererParams<AccountFields, 'market.id'>) =>
            data?.market?.id &&
            data.type === AccountType['ACCOUNT_TYPE_MARGIN'] &&
            data?.asset.id ? (
              <MarginHealthChart
                marketId={data.market.id}
                assetId={data.asset.id}
              />
            ) : null
          }
        />
      </AgGrid>
    );
  }
);

export default BreakdownTable;

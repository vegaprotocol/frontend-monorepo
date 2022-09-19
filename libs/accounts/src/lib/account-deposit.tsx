import { forwardRef } from 'react';
import type {
  GroupCellRendererParams,
  ValueFormatterParams,
} from 'ag-grid-community';
import { addDecimalsFormatNumber, t } from '@vegaprotocol/react-helpers';
import { Button, Icon } from '@vegaprotocol/ui-toolkit';
import { TooltipCellComponent } from '@vegaprotocol/ui-toolkit';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import { AgGridColumn } from 'ag-grid-react';
import type { AgGridReact, AgGridReactProps } from 'ag-grid-react';
import type { AccountFieldsFragment } from './__generated__/Accounts';
import { getId } from './accounts-data-provider';
import type { AccountFields } from './accounts-manager';
import {
  progressBarCellRendererSelector,
  progressBarHeaderComponentParams,
  progressBarValueFormatter,
} from './accounts-table';

interface AccountsTableProps extends AgGridReactProps {
  data: AccountFields[] | null;
  onClickAsset: () => void;
  onClickWithdraw: () => void;
  onClickDeposit: () => void;
  expanded: boolean;
  showRows: boolean;
}

interface AccountsTableValueFormatterParams extends ValueFormatterParams {
  data: AccountFieldsFragment;
}

export const assetDecimalsFormatter = ({
  value,
  data,
}: AccountsTableValueFormatterParams) =>
  addDecimalsFormatNumber(value, data.asset.decimals);

export const AccountDeposit = forwardRef<AgGridReact, AccountsTableProps>(
  (
    { data, onClickAsset, expanded, showRows, onClickWithdraw, onClickDeposit },
    ref
  ) => {
    const openAssetAccountCellRenderer = ({ value }: GroupCellRendererParams) =>
      showRows ? (
        <button onClick={onClickAsset}>
          <span className="p-2">
            <Icon
              name="chevron-down"
              className={expanded ? 'rotate-180' : ''}
              size={3}
            />
          </span>
          {value}
        </button>
      ) : (
        <button className="pl-4">{value}</button>
      );
    return (
      <AgGrid
        style={{ width: '100%', height: '100%' }}
        rowData={data}
        getRowId={({ data }) => getId(data)}
        ref={ref}
        rowHeight={34}
        tooltipShowDelay={500}
        headerHeight={0}
        defaultColDef={{
          flex: 1,
          resizable: true,
          tooltipComponent: TooltipCellComponent,
        }}
      >
        <AgGridColumn
          headerName={t('Asset')}
          field="asset.symbol"
          headerTooltip={t(
            'Asset is the collateral that is deposited into the Vega protocol.'
          )}
          cellRenderer={openAssetAccountCellRenderer}
        />
        <AgGridColumn
          headerName={t('Used')}
          field="used"
          flex={2}
          headerComponentParams={progressBarHeaderComponentParams}
          cellRendererSelector={progressBarCellRendererSelector}
          valueFormatter={progressBarValueFormatter}
        />
        <AgGridColumn
          headerName=""
          field="deposit"
          cellRenderer={() => {
            return (
              <Button size="xs" data-testid="deposit" onClick={onClickDeposit}>
                {t('Deposit')}
              </Button>
            );
          }}
        />
        <AgGridColumn
          headerName=""
          field="withdraw"
          cellRenderer={() => {
            return (
              <Button
                size="xs"
                data-testid="withdraw"
                onClick={onClickWithdraw}
              >
                {t('Withdraw')}
              </Button>
            );
          }}
        />
      </AgGrid>
    );
  }
);

export default AccountDeposit;

import { useCallback, useRef, useState } from 'react';
import type {
  GroupCellRendererParams,
  ValueFormatterParams,
} from 'ag-grid-community';
import type { Asset, ValueProps } from '@vegaprotocol/react-helpers';
import {
  calculateLowHighRange,
  progressBarCellRendererSelector,
} from '@vegaprotocol/react-helpers';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import { addDecimalsFormatNumber, t } from '@vegaprotocol/react-helpers';
import { Button, ButtonLink, Dialog, Intent } from '@vegaprotocol/ui-toolkit';
import { TooltipCellComponent } from '@vegaprotocol/ui-toolkit';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import { AgGridColumn } from 'ag-grid-react';
import type { AgGridReact, AgGridReactProps } from 'ag-grid-react';
import {
  accountsDataProvider,
  getAccountData,
  getId,
} from './accounts-data-provider';
import type { AccountFields } from './accounts-data-provider';
import type {
  AccountEventsSubscription,
  AccountFieldsFragment,
} from './__generated___/Accounts';
import BreakdownTable from './breakdown-table';
import produce from 'immer';
import merge from 'lodash/merge';

interface AccountsTableProps extends AgGridReactProps {
  partyId: string;
  onClickAsset: (value?: string | Asset) => void;
  onClickWithdraw?: () => void;
  onClickDeposit?: () => void;
}

export const progressBarValueFormatter = ({
  data,
  node,
}: ValueFormatterParams): ValueProps['valueFormatted'] | undefined => {
  if (!data || node?.rowPinned) {
    return undefined;
  }
  const min = BigInt(data.used);
  const max = BigInt(data.deposited);
  const mid = max > min ? max - min : max;
  const intent = Intent.None;
  const decimals = data.asset.decimals;
  return calculateLowHighRange(max, min, decimals, mid, intent);
};

export const progressBarHeaderComponentParams = {
  template:
    '<div class="ag-cell-label-container" role="presentation">' +
    `  <span>${t('Available')}</span>` +
    '  <span ref="eText" class="ag-header-cell-text"></span>' +
    '</div>',
};

interface AccountsTableValueFormatterParams extends ValueFormatterParams {
  data: AccountFieldsFragment;
}

export const assetDecimalsFormatter = ({
  value,
  data,
}: AccountsTableValueFormatterParams) =>
  addDecimalsFormatNumber(value, data.asset.decimals);

export const AccountsTable = ({
  onClickAsset,
  onClickWithdraw,
  onClickDeposit,
  partyId,
}: AccountsTableProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const update = useCallback(
    ({ delta: deltas }: { delta: AccountEventsSubscription['accounts'] }) => {
      const update: AccountFieldsFragment[] = [];
      const add: AccountFieldsFragment[] = [];
      if (!gridRef.current?.api) {
        return false;
      }
      const api = gridRef.current.api;
      deltas.forEach((delta) => {
        const rowNode = api.getRowNode(getId(delta));
        if (rowNode) {
          const updatedData = produce<AccountFieldsFragment>(
            rowNode.data,
            (draft: AccountFieldsFragment) => {
              merge(draft, delta);
            }
          );
          if (updatedData !== rowNode.data) {
            update.push(updatedData);
          }
        } else {
          // #TODO handle new account (or leave it to data provider to handle it)
        }
      });
      if (update.length || add.length) {
        gridRef.current.api.applyTransactionAsync({
          update,
          add,
          addIndex: 0,
        });
      }
      return true;
    },
    [gridRef]
  );

  const { data: collateralData } = useDataProvider<
    AccountFieldsFragment[],
    AccountEventsSubscription['accounts']
  >({ dataProvider: accountsDataProvider, update, variables: { partyId } });
  const data = collateralData && getAccountData(collateralData);
  const [openBreakdown, setOpenBreakdown] = useState(false);
  const [breakdown, setBreakdown] = useState<AccountFields[] | null>(null);
  return (
    <>
      <AgGrid
        style={{ width: '100%', height: '100%' }}
        rowData={data}
        getRowId={({ data }) => getId(data)}
        ref={gridRef}
        rowHeight={34}
        tooltipShowDelay={500}
        defaultColDef={{
          flex: 1,
          resizable: true,
          tooltipComponent: TooltipCellComponent,
          sortable: true,
        }}
      >
        <AgGridColumn
          headerName={t('Asset')}
          field="asset.symbol"
          headerTooltip={t(
            'Asset is the collateral that is deposited into the Vega protocol.'
          )}
          cellRenderer={({ value }: ValueFormatterParams) => {
            return (
              <ButtonLink
                data-testid="deposit"
                onClick={() => {
                  onClickAsset(value);
                }}
              >
                {value}
              </ButtonLink>
            );
          }}
          maxWidth={300}
        />
        <AgGridColumn
          headerName={t('Deposited')}
          field="deposited"
          valueFormatter={assetDecimalsFormatter}
          maxWidth={300}
        />
        <AgGridColumn
          headerName={t('Used')}
          field="used"
          flex={2}
          maxWidth={500}
          headerComponentParams={progressBarHeaderComponentParams}
          cellRendererSelector={progressBarCellRendererSelector}
          valueFormatter={progressBarValueFormatter}
        />
        <AgGridColumn
          headerName=""
          field="breakdown"
          maxWidth={150}
          cellRenderer={({ value }: GroupCellRendererParams) => {
            return (
              <ButtonLink
                data-testid="breakdown"
                onClick={() => {
                  setOpenBreakdown(!openBreakdown);
                  setBreakdown(value);
                }}
              >
                {t('Collateral breakdown')}
              </ButtonLink>
            );
          }}
        />
        <AgGridColumn
          headerName=""
          field="deposit"
          maxWidth={200}
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
          maxWidth={200}
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
      <Dialog size="medium" open={openBreakdown} onChange={setOpenBreakdown}>
        <div className="h-[35vh] w-full m-auto flex flex-col">
          <h1 className="text-xl mb-4">{'Collateral breakdown'}</h1>
          <BreakdownTable data={breakdown} domLayout="autoHeight" />
        </div>
      </Dialog>
    </>
  );
};

export default AccountsTable;

import { useCallback, useRef, useState } from 'react';
import type {
  GroupCellRendererParams,
  ValueFormatterParams,
} from 'ag-grid-community';
import type { Asset } from '@vegaprotocol/react-helpers';
import {} from '@vegaprotocol/react-helpers';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import { addDecimalsFormatNumber, t } from '@vegaprotocol/react-helpers';
import type { ValueProps } from '@vegaprotocol/ui-toolkit';
import {
  Button,
  ButtonLink,
  Dialog,
  Intent,
  progressBarCellRendererSelector,
} from '@vegaprotocol/ui-toolkit';
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
import produce from 'immer';
import merge from 'lodash/merge';
import BreakdownTable from './breakdown-table';

interface AccountsTableProps extends AgGridReactProps {
  partyId: string;
  onClickAsset: (asset?: string | Asset) => void;
  onClickWithdraw?: (assetId?: string) => void;
  onClickDeposit?: (assetId?: string) => void;
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
  const range = max > min ? max : min;
  return {
    low: addDecimalsFormatNumber(min.toString(), data.asset.decimals, 2),
    high: addDecimalsFormatNumber(max.toString(), data.asset.decimals, 2),
    value: range ? Number((min * BigInt(100)) / range) : 0,
    intent: data.lowMarginLevel ? Intent.Warning : undefined,
  };
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
          cellRenderer={({ data }: GroupCellRendererParams) => {
            return (
              <Button
                size="xs"
                data-testid="deposit"
                onClick={() => {
                  onClickDeposit && onClickDeposit(data.asset.id);
                }}
              >
                {t('Deposit')}
              </Button>
            );
          }}
        />
        <AgGridColumn
          headerName=""
          field="withdraw"
          maxWidth={200}
          cellRenderer={({ data }: GroupCellRendererParams) => {
            return (
              <Button
                size="xs"
                data-testid="withdraw"
                onClick={() =>
                  onClickWithdraw && onClickWithdraw(data.asset.id)
                }
              >
                {t('Withdraw')}
              </Button>
            );
          }}
        />
      </AgGrid>
      <Dialog size="medium" open={openBreakdown} onChange={setOpenBreakdown}>
        <div className="h-[35vh] w-full m-auto flex flex-col">
          <h1 className="text-xl mb-4">{t('Collateral breakdown')}</h1>
          <BreakdownTable data={breakdown} domLayout="autoHeight" />
        </div>
      </Dialog>
    </>
  );
};

export default AccountsTable;

import { forwardRef, useCallback, useMemo, useRef, useState } from 'react';
import { AsyncRenderer, Dialog } from '@vegaprotocol/ui-toolkit';
import {
  addSummaryRows,
  t,
  useDataProvider,
} from '@vegaprotocol/react-helpers';
import type { AccountFieldsFragment } from './__generated__/Accounts';
import {
  accountsDataProvider,
  getAccountData,
  getGroupId,
  getGroupSummaryRow,
  getId,
} from './accounts-data-provider';
import AccountsTable from './accounts-table';
import type { AgGridReact } from 'ag-grid-react';
import { AccountDeposit } from './account-deposit';
import { WithdrawalDialogs } from '@vegaprotocol/withdraws';
import { Web3Container } from '@vegaprotocol/web3';
import { DepositContainer } from '@vegaprotocol/deposits';
import produce from 'immer';
import merge from 'lodash/merge';
import classNames from 'classnames';

export interface AccountFields extends AccountFieldsFragment {
  available: string;
  used: string;
  deposited: string;
  balance: string;
}

const getSymbols = (account: AccountFieldsFragment[]) =>
  Array.from(new Set(account.map((a) => a.asset.symbol))).sort();

interface AccountsManagerProps {
  partyId: string;
}

export const AccountsManager = ({ partyId }: AccountsManagerProps) => {
  const variables = useMemo(() => ({ partyId }), [partyId]);
  const assetSymbols = useRef<string[] | undefined>();
  const gridRef = useRef<AgGridReact | null>(null);
  const update = useCallback(
    ({ delta }: { delta: AccountFieldsFragment }) => {
      const update: AccountFieldsFragment[] = [];
      const add: AccountFieldsFragment[] = [];
      if (!gridRef.current?.api) {
        return false;
      }
      const rowNode = gridRef.current.api.getRowNode(getId(delta));
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
        add.push(delta);
      }
      if (update.length || add.length) {
        gridRef.current.api.applyTransactionAsync({
          update,
          add,
          addIndex: 0,
        });
      }
      if (add.length) {
        addSummaryRows(
          gridRef.current.api,
          gridRef.current.columnApi,
          getGroupId,
          getGroupSummaryRow
        );
      }
      return true;
    },
    [gridRef]
  );

  const { data, error, loading } = useDataProvider<
    AccountFieldsFragment[],
    AccountFieldsFragment
  >({ dataProvider: accountsDataProvider, update, variables });

  const symbols = data && getSymbols(data);
  return (
    <Web3Container>
      <AsyncRenderer loading={loading} error={error} data={assetSymbols}>
        {symbols &&
          symbols.map((assetSymbol, i) => (
            <AssetAccountTable
              ref={gridRef}
              key={assetSymbol}
              assetSymbol={assetSymbol}
              data={data}
              hideHeader={i !== 0}
            />
          ))}
      </AsyncRenderer>
    </Web3Container>
  );
};

export interface AssetAccountTableProps {
  assetSymbol: string;
  data: AccountFieldsFragment[];
  hideHeader?: boolean;
}

export const AssetAccountTable = forwardRef<
  AgGridReact,
  AssetAccountTableProps
>(({ data, assetSymbol, hideHeader }, ref) => {
  const { accountRows, depositRow } = getAccountData(data, assetSymbol);
  const [open, setOpen] = useState(false);
  const [withdrawDialog, setWithdrawDialog] = useState(false);
  const [depositDialog, setDepositDialog] = useState(false);
  return (
    <>
      <div
        className={classNames({
          'h-[50px]': hideHeader,
          'h-[85px]': !hideHeader,
        })}
      >
        <AccountDeposit
          ref={ref}
          data={[depositRow]}
          expanded={open}
          showRows={accountRows?.length > 0}
          hideHeader={hideHeader}
          onClickAsset={() => setOpen(!open)}
          onClickWithdraw={() => setWithdrawDialog(true)}
          onClickDeposit={() => setDepositDialog(true)}
        />
      </div>
      {open && accountRows.length > 0 && (
        <div className="h-[15vh]">
          <AccountsTable ref={ref} data={accountRows} domLayout="autoHeight" />
        </div>
      )}
      <WithdrawalDialogs
        assetId={depositRow.asset.id}
        withdrawDialog={withdrawDialog}
        setWithdrawDialog={setWithdrawDialog}
      />
      <DepositDialog
        assetId={depositRow.asset.id}
        depositDialog={depositDialog}
        setDepositDialog={setDepositDialog}
      />
    </>
  );
});

export interface DepositDialogProps {
  assetId: string;
  depositDialog: boolean;
  setDepositDialog: (open: boolean) => void;
}

export const DepositDialog = ({
  assetId,
  depositDialog,
  setDepositDialog,
}: DepositDialogProps) => {
  return (
    <Dialog open={depositDialog} onChange={setDepositDialog}>
      <h1 className="text-2xl mb-4">{t('Deposit')}</h1>
      <DepositContainer assetId={assetId} />
    </Dialog>
  );
};

import { useCallback, useMemo, useRef, useState } from 'react';
import { AsyncRenderer, Dialog } from '@vegaprotocol/ui-toolkit';
import { t, useDataProvider } from '@vegaprotocol/react-helpers';
import type { AccountFieldsFragment } from './__generated__/Accounts';
import { accountsDataProvider, getAccountData } from './accounts-data-provider';
import AccountsTable from './accounts-table';
import type { AgGridReact } from 'ag-grid-react';
import { AccountDeposit } from './account-deposit';
import { WithdrawalDialogs } from '@vegaprotocol/withdraws';
import { Web3Container } from '@vegaprotocol/web3';
import { DepositContainer } from '@vegaprotocol/deposits';

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

  const update = useCallback(
    ({ data }: { data: AccountFieldsFragment[] | null }) => {
      if (data?.length) {
        const newAssetSymbols = getSymbols(data);
        if (
          !newAssetSymbols.every(
            (symbol) =>
              assetSymbols.current && assetSymbols.current.includes(symbol)
          )
        ) {
          return false;
        }
      }
      return true;
    },
    []
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
          symbols.map((assetSymbol) => (
            <AssetAccountTable
              key={assetSymbol}
              assetSymbol={assetSymbol}
              data={data}
            />
          ))}
      </AsyncRenderer>
    </Web3Container>
  );
};

export const AssetAccountTable = ({
  data,
  assetSymbol,
}: {
  assetSymbol: string;
  data: AccountFieldsFragment[];
}) => {
  const { positionRows, depositRow } = getAccountData(data, assetSymbol);
  const [open, setOpen] = useState(false);
  const gridRef = useRef<AgGridReact | null>(null);
  const [withdrawDialog, setWithdrawDialog] = useState(false);
  const [depositDialog, setDepositDialog] = useState(false);
  return (
    <>
      <div className="h-[50px]">
        <AccountDeposit
          ref={gridRef}
          data={[depositRow]}
          expanded={open}
          showRows={positionRows?.length > 0}
          onClickAsset={() => setOpen(!open)}
          onClickWithdraw={() => setWithdrawDialog(true)}
          onClickDeposit={() => setDepositDialog(true)}
        />
      </div>
      {open && positionRows.length > 0 && (
        <div className="h-[15vh]">
          <AccountsTable
            ref={gridRef}
            data={positionRows}
            domLayout="autoHeight"
          />
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
};

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

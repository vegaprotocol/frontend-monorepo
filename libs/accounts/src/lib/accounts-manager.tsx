import type { Asset } from '@vegaprotocol/assets';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import type { AgGridReact } from 'ag-grid-react';
import { useRef, useMemo, useCallback } from 'react';
import type { AccountFields } from './accounts-data-provider';
import { aggregatedAccountsDataProvider } from './accounts-data-provider';
import { AccountTable } from './accounts-table';

interface AccountManagerProps {
  partyId: string;
  onClickAsset: (asset?: string | Asset) => void;
  onClickWithdraw?: (assetId?: string) => void;
  onClickDeposit?: (assetId?: string) => void;
}

export const AccountManager = ({
  onClickAsset,
  onClickWithdraw,
  onClickDeposit,
  partyId,
}: AccountManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const dataRef = useRef<AccountFields[] | null>(null);
  const variables = useMemo(() => ({ partyId }), [partyId]);
  const update = useCallback(
    ({ data }: { data: AccountFields[] | null }) => {
      if (!gridRef.current?.api) {
        return false;
      }
      if (dataRef.current?.length) {
        dataRef.current = data;
        gridRef.current.api.refreshInfiniteCache();
        return true;
      }
      return false;
    },
    [gridRef]
  );
  const { data } = useDataProvider<AccountFields[], never>({
    dataProvider: aggregatedAccountsDataProvider,
    update,
    variables,
  });
  if (!dataRef.current && data) {
    dataRef.current = data;
  }
  return (
    <AccountTable
      rowData={data}
      ref={gridRef}
      onClickAsset={onClickAsset}
      onClickDeposit={onClickDeposit}
      onClickWithdraw={onClickWithdraw}
    />
  );
};

export default AccountManager;

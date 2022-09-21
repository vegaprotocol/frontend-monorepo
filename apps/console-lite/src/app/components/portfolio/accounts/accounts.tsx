import { useMemo, useRef } from 'react';
import type { AgGridReact } from 'ag-grid-react';
import { PriceCell, useDataProvider } from '@vegaprotocol/react-helpers';
import type { AccountFieldsFragment, AccountEventsSubscription } from '@vegaprotocol/accounts';
import {
  accountsDataProvider,
  accountsManagerUpdate,
  getId,
} from '@vegaprotocol/accounts';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import {
  AssetDetailsDialog,
  useAssetDetailsDialogStore,
} from '@vegaprotocol/assets';
import { ConsoleLiteGrid } from '../../console-lite-grid';
import { useAccountColumnDefinitions } from '.';

interface AccountObj extends AccountFieldsFragment {
  id: string;
}

interface Props {
  partyId: string;
}

const AccountsManager = ({ partyId }: Props) => {
  const {
    isAssetDetailsDialogOpen,
    assetDetailsDialogSymbol,
    setAssetDetailsDialogOpen,
  } = useAssetDetailsDialogStore();
  const gridRef = useRef<AgGridReact | null>(null);
  const variables = useMemo(() => ({ partyId }), [partyId]);
  const update = accountsManagerUpdate(gridRef);
  const { data, error, loading } = useDataProvider<
    AccountFieldsFragment[],
    AccountEventsSubscription['accounts']
  >({ dataProvider: accountsDataProvider, update, variables });
  const { columnDefs, defaultColDef } = useAccountColumnDefinitions();
  return (
    <>
      <AsyncRenderer loading={loading} error={error} data={data}>
        <ConsoleLiteGrid<AccountObj>
          data={data as AccountObj[]}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          components={{ PriceCell }}
          getRowId={({ data }) => getId(data)}
        />
      </AsyncRenderer>
      <AssetDetailsDialog
        assetSymbol={assetDetailsDialogSymbol}
        open={isAssetDetailsDialogOpen}
        onChange={(open) => setAssetDetailsDialogOpen(open)}
      />
    </>
  );
};

export default AccountsManager;

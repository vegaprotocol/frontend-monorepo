import { useMemo, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { AgGridReact } from 'ag-grid-react';
import { PriceCell, useDataProvider } from '@vegaprotocol/react-helpers';
import type {
  AccountFieldsFragment,
  AccountEventsSubscription,
} from '@vegaprotocol/accounts';
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
import { NO_DATA_MESSAGE } from '../../../constants';
import { ConsoleLiteGrid } from '../../console-lite-grid';
import { useAccountColumnDefinitions } from '.';

interface AccountObj extends AccountFieldsFragment {
  id: string;
}

const AccountsManager = () => {
  const { partyId = '' } = useOutletContext<{ partyId: string }>();
  const { isOpen, symbol, setOpen } = useAssetDetailsDialogStore();
  const gridRef = useRef<AgGridReact | null>(null);
  const variables = useMemo(() => ({ partyId }), [partyId]);
  const update = useMemo(() => accountsManagerUpdate(gridRef), []);
  const { data, error, loading } = useDataProvider<
    AccountFieldsFragment[],
    AccountEventsSubscription['accounts']
  >({ dataProvider: accountsDataProvider, update, variables });
  const { columnDefs, defaultColDef } = useAccountColumnDefinitions();
  return (
    <>
      <AsyncRenderer
        loading={loading}
        error={error}
        data={data}
        noDataMessage={NO_DATA_MESSAGE}
      >
        <ConsoleLiteGrid<AccountObj>
          rowData={data as AccountObj[]}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          components={{ PriceCell }}
          getRowId={({ data }) => getId(data)}
        />
      </AsyncRenderer>
      <AssetDetailsDialog
        assetSymbol={symbol}
        open={isOpen}
        onChange={(open) => setOpen(open)}
      />
    </>
  );
};

export default AccountsManager;

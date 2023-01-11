import { useMemo, useRef, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { AgGridReact } from 'ag-grid-react';
import { PriceCell, useDataProvider } from '@vegaprotocol/react-helpers';
import type { AccountFields } from '@vegaprotocol/accounts';
import { aggregatedAccountsDataProvider, getId } from '@vegaprotocol/accounts';
import type { IGetRowsParams } from 'ag-grid-community';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import {
  AssetDetailsDialog,
  useAssetDetailsDialogStore,
} from '@vegaprotocol/assets';
import { NO_DATA_MESSAGE } from '../../../constants';
import { ConsoleLiteGrid } from '../../console-lite-grid';
import { useAccountColumnDefinitions } from '.';

const AccountsManager = () => {
  const { partyId = '' } = useOutletContext<{ partyId: string }>();
  const { isOpen, id, setOpen } = useAssetDetailsDialogStore();
  const gridRef = useRef<AgGridReact | null>(null);
  const dataRef = useRef<AccountFields[] | null>(null);
  const variables = useMemo(() => ({ partyId }), [partyId]);
  const update = useCallback(
    ({ data }: { data: AccountFields[] | null }) => {
      dataRef.current = data;
      gridRef.current?.api?.refreshInfiniteCache();
      return true;
    },
    [gridRef]
  );
  const { data, error, loading } = useDataProvider<AccountFields[], never>({
    dataProvider: aggregatedAccountsDataProvider,
    update,
    variables,
  });
  const getRows = async ({
    successCallback,
    startRow,
    endRow,
  }: IGetRowsParams) => {
    const rowsThisBlock = dataRef.current
      ? dataRef.current.slice(startRow, endRow)
      : [];
    const lastRow = dataRef.current ? dataRef.current.length : 0;
    successCallback(rowsThisBlock, lastRow);
  };
  const { columnDefs, defaultColDef } = useAccountColumnDefinitions();
  return (
    <>
      <AsyncRenderer
        loading={loading}
        error={error}
        data={data?.length ? data : null}
        noDataMessage={NO_DATA_MESSAGE}
      >
        <ConsoleLiteGrid<AccountFields>
          rowData={data?.length ? undefined : []}
          rowModelType={data?.length ? 'infinite' : 'clientSide'}
          ref={gridRef}
          datasource={{ getRows }}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          components={{ PriceCell }}
          getRowId={({ data }) => getId(data)}
        />
      </AsyncRenderer>
      <AssetDetailsDialog
        assetId={id}
        open={isOpen}
        onChange={(open) => setOpen(open)}
      />
    </>
  );
};

export default AccountsManager;

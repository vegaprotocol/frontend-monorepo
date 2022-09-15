import { useCallback, useMemo, useRef } from 'react';
import { Accordion, AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import type { AccountFieldsFragment } from './__generated__/Accounts';
import { accountsDataProvider } from './accounts-data-provider';
import AccountsTable from './accounts-table';
import type { AgGridReact } from 'ag-grid-react';
import { AccountType } from '@vegaprotocol/types';

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
  const gridRef = useRef<AgGridReact | null>(null);
  const symbols = data && getSymbols(data);
  return (
    <div className="mx-4">
      <AsyncRenderer loading={loading} error={error} data={assetSymbols}>
        <Accordion
          panels={
            (symbols &&
              symbols.map((assetSymbol) => {
                const rowData = data?.filter(
                  (a) =>
                    a.asset.symbol === assetSymbol &&
                    a.type === AccountType.ACCOUNT_TYPE_MARGIN
                );
                return {
                  title: assetSymbol,
                  content: (
                    <div className="h-[25vh] mb-2 border-b-2 border-gray">
                      <AccountsTable
                        domLayout="autoHeight"
                        ref={gridRef}
                        rowModelType={data?.length ? 'infinite' : 'clientSide'}
                        data={rowData}
                      />
                    </div>
                  ),
                };
              })) ||
            []
          }
        />
      </AsyncRenderer>
    </div>
  );
};

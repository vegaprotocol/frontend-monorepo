import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { removePaginationWrapper } from '@vegaprotocol/utils';
import { useScrollToLocation } from '../../hooks/scroll-to-location';
import { useDocumentTitle } from '../../hooks/use-document-title';
import {
  type ExplorerTreasuryQuery,
  useExplorerTreasuryQuery,
} from './__generated__/Treasury';
import AssetBalance from '../../components/asset-balance/asset-balance';
import { AccountType } from '@vegaprotocol/types';

export interface NetworkAccountsTableProps
  extends React.HTMLAttributes<HTMLTableElement> {
  data?: ExplorerTreasuryQuery | undefined;
  error?: Error;
  loading: boolean;
}

export const NetworkAccountsTable = ({
  data,
  error,
  loading,
}: NetworkAccountsTableProps) => (
  <section>
    <AsyncRenderer
      data={data}
      loading={loading}
      error={error}
      render={(data) => {
        const c = data?.party?.accountsConnection
          ? removePaginationWrapper(data?.party?.accountsConnection.edges)
          : [];
        return (
          <ul className="-mt-6">
            {c
              .filter((a) => a.balance !== '0')
              .map((a) => {
                return (
                  <li
                    key={a.balance}
                    className="flex items-center justify-between"
                  >
                    <AssetBalance assetId={a.asset.id} price={a.balance} />
                    {AccountType[a.type]}
                  </li>
                );
              })}
          </ul>
        );
      }}
    />
  </section>
);

export const NetworkTreasury = () => {
  const { data, loading, error } = useExplorerTreasuryQuery({
    // This needs to ignore error as old assets may no longer properly resolve
    errorPolicy: 'ignore',
    variables: {
      partyId: 'network',
    },
  });

  useDocumentTitle(['Network Treasury']);
  useScrollToLocation();
  return <NetworkAccountsTable data={data} error={error} loading={loading} />;
};

import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import {
  type ExplorerTreasuryQuery,
  useExplorerTreasuryQuery,
} from '../__generated__/Treasury';
import { AssetBalance } from '../../../components/asset-balance/asset-balance';
import { AssetLink } from '../../../components/links';
import { useMemo } from 'react';
import { useScreenDimensions } from '@vegaprotocol/react-helpers';
import { type NonZeroAccount } from '../network-treasury';
import { AccountType } from '@vegaprotocol/types';
import { removePaginationWrapper } from '@vegaprotocol/utils';

export const NetworkAccountsTable = () => {
  const { data, loading, error } = useExplorerTreasuryQuery({
    // This needs to ignore error as old assets may no longer properly resolve
    errorPolicy: 'ignore',
  });
  const { screenSize } = useScreenDimensions();
  const shouldRound = useMemo(
    () => ['xs', 'sm', 'md', 'lg'].includes(screenSize),
    [screenSize]
  );

  return (
    <AsyncRenderer
      data={data}
      loading={loading}
      error={error}
      render={(data) => {
        const c = parseResultsToAccounts(data);
        return (
          <section className="md:flex md:flex-row flex-wrap">
            {c.map((a) => (
              <div
                className="basis-1/2 md:basis-1/4"
                key={`${a.assetId}-${a.balance}`}
              >
                <div className="rounded overflow-hidden shadow-lg bg-gs-900">
                  <div className="text-center p-6 bg-gs-800 border-b border-gs-500">
                    <p className="mt-3" data-testid="name">
                      <AssetLink assetId={a.assetId} />
                    </p>
                  </div>
                  <div className="text-center py-5" data-testid="balance">
                    <AssetBalance
                      assetId={a.assetId}
                      price={a.balance}
                      showAssetSymbol={true}
                      rounded={shouldRound}
                    />
                  </div>
                </div>
              </div>
            ))}
          </section>
        );
      }}
    />
  );
};

export function parseResultsToAccounts(
  data: ExplorerTreasuryQuery
): NonZeroAccount[] {
  const nonZeroAccounts: NonZeroAccount[] = [];
  if (data?.assetsConnection?.edges) {
    const edges = removePaginationWrapper(data?.assetsConnection?.edges);
    if (edges) {
      edges.forEach((edge) => {
        if (
          edge.networkTreasuryAccount &&
          edge.networkTreasuryAccount?.balance !== '0'
        ) {
          nonZeroAccounts.push({
            assetId: edge.id,
            balance: edge.networkTreasuryAccount?.balance,
            type: AccountType.ACCOUNT_TYPE_NETWORK_TREASURY,
          });
        }
      });
    }
  }

  return nonZeroAccounts;
}

import { useExplorerPartyAssetsQuery } from '../__generated__/Party-assets';
import { AssetLink, MarketLink } from '../../../../components/links';
import AssetBalance from '../../../../components/asset-balance/asset-balance';
import { AccountTypeMapping } from '@vegaprotocol/types';

interface PartyAccountsProps {
  partyId: string;
}

/**
 * Renders a list of a party's accounts as a table. Currently unsorted, but could
 * probably do with sorting by asset, and then within asset, by type with general
 * appearing first and... tbd
 */
export const PartyAccounts = ({ partyId }: PartyAccountsProps) => {
  const { data } = useExplorerPartyAssetsQuery({
    variables: { partyId },
  });

  const party = data?.partiesConnection?.edges[0]?.node;
  const accounts =
    party?.accountsConnection?.edges?.filter((edge) => edge?.node) || [];

  return (
    <div className="block min-h-44 h-60 4 w-full border-red-800 relative">
      <table>
        <thead>
          <tr>
            <th className="text-right px-4">Balance</th>
            <th className="text-left px-4">Type</th>
            <th className="text-left px-4">Market</th>
            <th className="text-left px-4">Asset</th>
          </tr>
        </thead>
        <tbody>
          {accounts
            .sort((a, b) => {
              // Sort by asset id, then market id, with general accounts first
              if (!a) {
                return 1;
              }
              if (!b) {
                return -1;
              }
              if (a.node.asset.id !== b.node.asset.id) {
                return a.node.asset.id.localeCompare(b.node.asset.id);
              }
              if (a.node.type === 'ACCOUNT_TYPE_GENERAL') return -1;
              if (b.node.type === 'ACCOUNT_TYPE_GENERAL') return 1;
              if (a.node.market && b.node.market) {
                return a.node.market.id.localeCompare(b.node.market.id);
              } else {
                return a.node.type.localeCompare(b.node.type);
              }
            })
            .map((e) => {
              if (!e) return null;
              const { type, asset, balance, market } = e.node;

              return (
                <tr className="border-t border-neutral-300 dark:border-neutral-600">
                  <td className="px-4 text-right">
                    <AssetBalance
                      assetId={asset.id}
                      price={balance}
                      showAssetSymbol={true}
                    />
                  </td>
                  <td className="px-4">{AccountTypeMapping[type]}</td>
                  <td className="px-4">
                    {market?.id ? <MarketLink id={market.id} /> : '-'}
                  </td>
                  <td className="px-4">
                    <AssetLink assetId={asset.id} />
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};

import { useExplorerPartyAssetsQuery } from '../__generated__/Party-assets';
import { AssetLink, MarketLink } from '../../../../components/links';
import AssetBalance from '../../../../components/asset-balance/asset-balance';
import { AccountTypeMapping, MarginMode } from '@vegaprotocol/types';
import { t } from '@vegaprotocol/i18n';
import { Leverage } from '../../../../components/leverage/leverage';

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
            <th className="text-right px-4">{t('Balance')}</th>
            <th className="text-left px-4">{t('Type')}</th>
            <th className="text-left px-4">{t('Market')}</th>
            <th className="text-left px-4">{t('Asset')}</th>
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

              // Blank by default, as most accounts do not relate to a market
              let marginFactor = undefined;

              let marginLabel =
                MarginLabels[MarginMode.MARGIN_MODE_UNSPECIFIED];
              if (market?.id && party?.marginsConnection) {
                const m = party?.marginsConnection?.edges?.find(
                  (e) => e.node.market.id === market.id
                );
                if (m) {
                  marginLabel = MarginLabels[m.node.marginMode];
                  marginFactor =
                    m?.node?.marginFactor !== '0'
                      ? m.node.marginFactor
                      : undefined;
                }
              }

              return (
                <tr className="border-t border-neutral-300 dark:border-neutral-600">
                  <td className="px-4 text-right">
                    <AssetBalance
                      assetId={asset.id}
                      price={balance}
                      showAssetSymbol={true}
                    />
                  </td>
                  <td className="px-4">
                    {marginLabel}
                    {marginLabel.length > 0
                      ? AccountTypeMapping[type].toLowerCase()
                      : AccountTypeMapping[type]}
                    {marginFactor && type === 'ACCOUNT_TYPE_ORDER_MARGIN' && (
                      <span className="ml-1">
                        (<Leverage marginFactor={marginFactor} />)
                      </span>
                    )}
                  </td>
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

const MarginLabels: Record<MarginMode, string> = {
  [MarginMode.MARGIN_MODE_CROSS_MARGIN]: 'Cross ',
  [MarginMode.MARGIN_MODE_ISOLATED_MARGIN]: 'Isolated ',
  [MarginMode.MARGIN_MODE_UNSPECIFIED]: '',
};

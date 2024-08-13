import { MarketLink } from '../../../components/links';
import PriceInAsset from '../../../components/price-in-asset/price-in-asset';
import { Table, TableCell, TableRow } from '../../../components/table';
import type { AssetMarketsQuery } from './__generated__/Asset-Markets';
import { useAssetMarketsQuery } from './__generated__/Asset-Markets';
import { t } from '@vegaprotocol/i18n';
import { MarketState, MarketStateMapping } from '@vegaprotocol/types';

type AssetMarketProps = {
  asset: string;
  symbol: string;
  decimals: number;
};

/**
 * Renders a KeyValueTable of market IDs and their insurance account balances. On the Explorer
 * asset page, this sits directly under the AssetDetails table
 *
 * @param param0
 * @returns
 */
export const AssetMarkets = ({ asset, decimals, symbol }: AssetMarketProps) => {
  const { data } = useAssetMarketsQuery();

  const markets = transformAssetMarketsQuery(data, asset);

  return (
    <div className="mt-10" data-testid="asset-balance">
      <h2 className="text-xl mb-3">{t('Market insurance account')}</h2>
      {markets && markets.length === 0 ? (
        <p>
          {t(
            'There are no markets with an insurance account balance in this asset'
          )}
        </p>
      ) : (
        <Table>
          {markets.map((market) => {
            return (
              market.marketId &&
              market.balance !== '0' && (
                <TableRow className="py-1 border-b border-gs-600">
                  <TableCell className="py-1">
                    <MarketLink id={market.marketId} />
                  </TableCell>
                  <TableCell className="py-1">
                    {market.state ? MarketStateMapping[market.state] : ''}
                  </TableCell>
                  <TableCell align="right" className="py-1">
                    <PriceInAsset
                      price={market.balance}
                      symbol={symbol}
                      decimals={decimals}
                    />
                  </TableCell>
                </TableRow>
              )
            );
          })}
        </Table>
      )}
    </div>
  );
};

export type AssetMarketInsuranceAccount = {
  marketId: string;
  balance: string;
  state: MarketState;
};

/**
 * There is no filter for markets by asset, so this function takes the list of all (active)
 * markets, filters for just the ones with the desired asset as a base, then reformats the
 * data to just provide a market ID and a balance for the insurance account.
 *
 * @param data AssetMarketsQuery Result of selecting all active markets by graphql
 * @param asset The asset we want to find insurance account balances for
 * @returns AssetMarketInsuranceAccount[] Array of market IDs and insurance account balances
 */
export function transformAssetMarketsQuery(
  data: AssetMarketsQuery | undefined,
  asset: string
): AssetMarketInsuranceAccount[] {
  // Iterate over markets and select markets that have the desired asset as the base asset
  const marketsWithAsset = data?.marketsConnection
    ? data.marketsConnection.edges.filter((edge) => {
        const accountsWithAsset = edge.node.accountsConnection?.edges?.filter(
          (e) => e?.node.asset?.id === asset
        );

        return accountsWithAsset && accountsWithAsset.length > 0;
      })
    : [];

  // Now reshape the data to only include the market ID and the balance of the insurance account
  return marketsWithAsset
    .map((market) => {
      const accountsWithAsset = market.node?.accountsConnection?.edges?.filter(
        (e) =>
          e?.node.type === 'ACCOUNT_TYPE_INSURANCE' &&
          e?.node.asset?.id === asset
      );

      return {
        marketId: market.node?.id || '',
        balance: accountsWithAsset?.[0]?.node?.balance || '0',
        state: market.node?.state || null,
      };
    })
    .sort((a, b) => (a.state === MarketState.STATE_ACTIVE ? -1 : 1));
}

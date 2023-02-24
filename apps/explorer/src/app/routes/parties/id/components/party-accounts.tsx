import { t } from '@vegaprotocol/utils';
import get from 'lodash/get';
import AssetBalance from '../../../../components/asset-balance/asset-balance';
import { AssetLink, MarketLink } from '../../../../components/links';
import { Table, TableRow } from '../../../../components/table';
import type * as Schema from '@vegaprotocol/types';
import type { ExplorerPartyAssetsAccountsFragment } from '../__generated__/Party-assets';

const accountTypeString: Record<Schema.AccountType, string> = {
  ACCOUNT_TYPE_BOND: t('Bond'),
  ACCOUNT_TYPE_EXTERNAL: t('External'),
  ACCOUNT_TYPE_FEES_INFRASTRUCTURE: t('Fees (Infrastructure)'),
  ACCOUNT_TYPE_FEES_LIQUIDITY: t('Fees (Liquidity)'),
  ACCOUNT_TYPE_FEES_MAKER: t('Fees (Maker)'),
  ACCOUNT_TYPE_GENERAL: t('General'),
  ACCOUNT_TYPE_GLOBAL_INSURANCE: t('Global Insurance Pool'),
  ACCOUNT_TYPE_GLOBAL_REWARD: t('Global Reward Pool'),
  ACCOUNT_TYPE_INSURANCE: t('Insurance'),
  ACCOUNT_TYPE_MARGIN: t('Margin'),
  ACCOUNT_TYPE_PENDING_TRANSFERS: t('Pending Transfers'),
  ACCOUNT_TYPE_REWARD_LP_RECEIVED_FEES: t('Reward - LP Fees received'),
  ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES: t('Reward - Maker fees paid'),
  ACCOUNT_TYPE_REWARD_MAKER_RECEIVED_FEES: t('Reward - Maker fees received'),
  ACCOUNT_TYPE_REWARD_MARKET_PROPOSERS: t('Reward - Market proposers'),
  ACCOUNT_TYPE_SETTLEMENT: t('Settlement'),
};

interface PartyAccountsProps {
  accounts: ExplorerPartyAssetsAccountsFragment[];
}

/**
 * Renders a list of a party's accounts as a table. Currently unsorted, but could
 * probably do with sorting by asset, and then within asset, by type with general
 * appearing first and... tbd
 */
export const PartyAccounts = ({ accounts }: PartyAccountsProps) => {
  return (
    <Table className="max-w-5xl min-w-fit">
      <thead>
        <TableRow modifier="bordered" className="font-mono">
          <td>{t('Type')}</td>
          <td>{t('Market')}</td>
          <td className="text-right pr-2">{t('Balance')}</td>
          <td>{t('Asset')}</td>
        </TableRow>
      </thead>
      <tbody>
        {accounts.map((account) => {
          const m = get(account, 'market.tradableInstrument.instrument.name');

          return (
            <TableRow
              key={`pa-${account.asset.id}-${account.type}`}
              title={account.asset.name}
              id={`${accountTypeString[account.type]} ${m ? ` - ${m}` : ''}`}
            >
              <td className="text-md">{accountTypeString[account.type]}</td>
              <td className="text-md">
                {account.market?.id ? (
                  <MarketLink id={account.market?.id} />
                ) : (
                  <p>-</p>
                )}
              </td>
              <td className="text-md text-right pr-2">
                <AssetBalance
                  assetId={account.asset.id}
                  price={account.balance}
                  showAssetLink={false}
                />
              </td>
              <td className="text-md">
                <AssetLink assetId={account.asset.id} />
              </td>
            </TableRow>
          );
        })}
      </tbody>
    </Table>
  );
};

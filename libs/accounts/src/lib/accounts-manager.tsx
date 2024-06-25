import orderBy from 'lodash/orderBy';
import sortBy from 'lodash/sortBy';
import { useEnabledAssets } from '@vegaprotocol/assets';
import { AccountCard, type AssetActions } from './account-card';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { aggregatedAccountsDataProvider } from './accounts-data-provider';
import { toQUSD } from '@vegaprotocol/utils';

interface AccountManagerProps extends AssetActions {
  partyId?: string;
  isReadOnly: boolean;
  pinnedAssets?: string[];
  orderByBalance?: boolean;
  hideZeroBalance?: boolean;
}

export const AccountManager = ({
  pinnedAssets,
  ...props
}: AccountManagerProps) => {
  const { data } = useEnabledAssets();

  const { data: accounts } = useDataProvider({
    dataProvider: aggregatedAccountsDataProvider,
    variables: { partyId: props.partyId || '' },
    skip: !props.partyId,
  });

  // default order by name
  let rows = orderBy(data || [], (a) => a.name.toLowerCase(), 'asc');

  const balances = orderBy(
    accounts
      ?.map((a) => ({
        assetId: a.asset.id,
        symbol: a.asset.symbol,
        totalBalance: Number(a.total),
        totalQUSD: toQUSD(a.total, a.asset.quantum).toNumber(),
      }))
      .filter((a) => a.totalBalance > 0),
    'totalQUSD',
    'desc'
  );

  // filter out the non zero balances
  if (props.hideZeroBalance) {
    const nonZeroAssets = balances.map((a) => a.assetId);
    rows = rows.filter(
      (asset) =>
        nonZeroAssets.includes(asset.id) || pinnedAssets?.includes(asset.id)
    );
  }

  // sort by balance
  if (props.orderByBalance) {
    rows = sortBy(rows, (asset) => {
      const found = balances.findIndex((b) => b.assetId === asset.id);
      if (found > -1) {
        return -1 * (balances.length - found);
      }
      return 0;
    });
  }

  // push pinned to top
  rows = sortBy(rows, (asset) => {
    if (!pinnedAssets) return 0;
    if (pinnedAssets.includes(asset.id)) return -1;
    return 1;
  });

  return (
    <div className="relative h-full" data-testid="accounts-list">
      {rows.map((asset) => {
        return (
          <AccountCard
            partyId={props.partyId}
            isReadOnly={props.isReadOnly}
            asset={asset}
            key={asset.id}
            expanded={pinnedAssets?.includes(asset.id)}
            onClickAsset={props.onClickAsset}
            onClickWithdraw={props.onClickWithdraw}
            onClickDeposit={props.onClickDeposit}
            onClickTransfer={props.onClickTransfer}
            onClickSwap={props.onClickSwap}
          />
        );
      })}
    </div>
  );
};

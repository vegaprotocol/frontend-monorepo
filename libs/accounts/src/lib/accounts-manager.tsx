import orderBy from 'lodash/orderBy';
import sortBy from 'lodash/sortBy';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { assetsProvider } from '@vegaprotocol/assets';
import { AccountCard, type AssetActions } from './account-card';

interface AccountManagerProps extends AssetActions {
  partyId?: string;
  isReadOnly: boolean;
  pinnedAssets?: string[];
}

export const AccountManager = ({
  pinnedAssets,
  ...props
}: AccountManagerProps) => {
  const { data } = useDataProvider({
    dataProvider: assetsProvider,
    variables: undefined,
  });

  const orderedData = orderBy(data || [], 'name', 'asc');
  const rows = sortBy(orderedData, (asset) => {
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
          />
        );
      })}
    </div>
  );
};

import { useT } from '../../lib/use-t';
import { Emblem } from '@vegaprotocol/emblem';
import { useAssetsMapProvider } from '@vegaprotocol/assets';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { aggregatedAccountDataProvider } from '@vegaprotocol/accounts';
import { addDecimalsFormatNumberQuantum } from '@vegaprotocol/utils';

export const AssetCard = ({
  assetId,
  showAllocation,
}: {
  assetId: string;
  showAllocation?: boolean;
}) => {
  const t = useT();
  const { pubKey } = useVegaWallet();
  const { data: account } = useDataProvider({
    dataProvider: aggregatedAccountDataProvider,
    variables: { partyId: pubKey || '', assetId },
    skip: !pubKey,
  });
  const { data: assets } = useAssetsMapProvider();
  const asset = assets?.[assetId];

  if (!asset) {
    return null;
  }

  return (
    <div className="p-3 border-b border-default text-left bg-vega-clight-800 dark:bg-vega-cdark-800">
      <div className="flex items-center mb-3">
        <Emblem asset={asset.id} />
        <span className="grow ml-2 text-lg">{asset.symbol}</span>
      </div>
      <div className="flex justify-between">
        {!showAllocation ? null : (
          <div>
            <div className="font-alpha text-xs text-vega-clight-200 dark:text-vega-cdark-200">
              {t('Allocation')}
            </div>
            <div className="text-base">
              {addDecimalsFormatNumberQuantum(
                account?.used || '0',
                asset.decimals,
                asset.quantum
              )}
            </div>
          </div>
        )}
        <div className={showAllocation ? 'text-right' : undefined}>
          <div className="font-alpha text-xs text-vega-clight-200 dark:text-vega-cdark-200">
            {t('Available')}
          </div>
          <div className="text-base">
            {addDecimalsFormatNumberQuantum(
              account?.available || '0',
              asset.decimals,
              asset.quantum
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

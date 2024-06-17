import { useT } from '../../lib/use-t';
import { Emblem } from '@vegaprotocol/emblem';
import { useAssetsMapProvider } from '@vegaprotocol/assets';
import { useChainId, useVegaWallet } from '@vegaprotocol/wallet-react';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { aggregatedAccountDataProvider } from '@vegaprotocol/accounts';
import { addDecimalsFormatNumberQuantum } from '@vegaprotocol/utils';
import { getExternalChainShortLabel } from '@vegaprotocol/environment';

export const AssetCard = ({
  assetId,
  showAllocation,
}: {
  assetId: string;
  showAllocation?: boolean;
}) => {
  const t = useT();
  const { pubKey } = useVegaWallet();
  const { chainId } = useChainId();
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
    <section
      className="p-3 border-b border-default text-left bg-vega-clight-800 dark:bg-vega-cdark-800"
      data-testid="asset-card"
    >
      <header className="flex gap-2 items-center mb-3">
        <span className="flex items-center shrink-0">
          <Emblem asset={asset.id} vegaChain={chainId} />
        </span>
        <span className="flex grow text-lg min-w-0">
          <span className="shrink-0">{asset.symbol}</span>
          {asset.source.__typename === 'ERC20' && (
            <small className="grow text-muted ml-0.5 truncate tracking-tight">
              {getExternalChainShortLabel(asset.source.chainId)}
            </small>
          )}
        </span>
      </header>
      <div className="flex justify-between">
        {!showAllocation ? null : (
          <dl>
            <dt className="text-xs text-vega-clight-200 dark:text-vega-cdark-200">
              {t('Allocation')}
            </dt>
            <dd className="text-base">
              {addDecimalsFormatNumberQuantum(
                account?.used || '0',
                asset.decimals,
                asset.quantum
              )}
            </dd>
          </dl>
        )}
        <dl className={showAllocation ? 'text-right' : undefined}>
          <dt className="text-xs text-vega-clight-200 dark:text-vega-cdark-200">
            {t('Available')}
          </dt>
          <dd className="text-base">
            {addDecimalsFormatNumberQuantum(
              account?.available || '0',
              asset.decimals,
              asset.quantum
            )}
          </dd>
        </dl>
      </div>
    </section>
  );
};

import { getAsset, useMarket } from '@vegaprotocol/markets';
import { useT } from '../../lib/use-t';
import { EmblemByAsset } from '@vegaprotocol/emblem';

export const AssetCard = ({ marketId }: { marketId?: string }) => {
  const t = useT();
  const { data } = useMarket(marketId);

  if (!marketId || !data) {
    return <span>{t('Assets')}</span>;
  }

  const asset = getAsset(data);

  return (
    <span>
      <span className="flex items-center gap-2 text-base">
        <EmblemByAsset asset={asset.id} />
        {asset.symbol}
      </span>
    </span>
  );
};

import { formatNumber, toBigNum } from '@vegaprotocol/react-helpers';
import type { Asset } from '@vegaprotocol/types';

type TransactionDetailsProps = {
  label: string;
  amount: string;
  asset: Pick<Asset, 'symbol' | 'decimals'>;
};
export const TransactionDetails = ({
  label,
  amount,
  asset,
}: TransactionDetailsProps) => {
  const num = formatNumber(toBigNum(amount, asset.decimals), asset.decimals);
  return (
    <div className="mt-[5px]">
      <span className="font-mono text-xs p-1 bg-gray-100 rounded">
        {label} {num} {asset.symbol}
      </span>
    </div>
  );
};

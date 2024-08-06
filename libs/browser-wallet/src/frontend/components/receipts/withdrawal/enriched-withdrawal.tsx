import { useFormatAssetAmount } from '@/hooks/format-asset-amount';

import { Header } from '../../header';
import { AmountWithSymbol } from '../utils/string-amounts/amount-with-symbol';
import { BaseWithdrawal } from './base-withdrawal';

export const EnrichedWithdrawal = ({
  amount,
  assetId,
  receiverAddress,
}: {
  receiverAddress: string;
  amount: string;
  assetId: string;
}) => {
  const { formattedAmount, symbol } = useFormatAssetAmount(assetId, amount);
  if (!formattedAmount || !symbol) return null;
  return (
    <BaseWithdrawal receiverAddress={receiverAddress} assetId={assetId}>
      <Header
        content={<AmountWithSymbol amount={formattedAmount} symbol={symbol} />}
      />
    </BaseWithdrawal>
  );
};

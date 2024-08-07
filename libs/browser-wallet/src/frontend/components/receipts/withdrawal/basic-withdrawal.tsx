import { Header } from '../../header';
import { AmountWithTooltip } from '../utils/string-amounts/amount-with-tooltip';
import { BaseWithdrawal } from './base-withdrawal';

export const BasicWithdrawal = ({
  amount,
  assetId,
  receiverAddress,
}: {
  receiverAddress: string;
  amount: string;
  assetId: string;
}) => {
  return (
    <BaseWithdrawal receiverAddress={receiverAddress} assetId={assetId}>
      <Header
        content={<AmountWithTooltip amount={amount} assetId={assetId} />}
      />
    </BaseWithdrawal>
  );
};

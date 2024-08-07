import { Header } from '../../header';
import type { ReceiptComponentProperties } from '../receipts';
import { AmountWithTooltip } from '../utils/string-amounts/amount-with-tooltip';

export const locators = {
  basicSection: 'basic-section',
};

export const BasicTransferView = ({
  transaction,
}: ReceiptComponentProperties) => {
  const { asset, amount } = transaction.transfer;
  return (
    <div data-testid={locators.basicSection}>
      <Header content={<AmountWithTooltip assetId={asset} amount={amount} />} />
    </div>
  );
};

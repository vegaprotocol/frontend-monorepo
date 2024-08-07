import type { ReactNode } from 'react';

import { ReceiptWrapper } from '../utils/receipt-wrapper';
import { ReceivingKey } from './receiving-key';

export const BaseWithdrawal = ({
  children,
  receiverAddress,
  assetId,
}: {
  receiverAddress: string;
  children: ReactNode;
  assetId: string;
}) => {
  return (
    <ReceiptWrapper>
      {children}
      <ReceivingKey address={receiverAddress} assetId={assetId} />
    </ReceiptWrapper>
  );
};

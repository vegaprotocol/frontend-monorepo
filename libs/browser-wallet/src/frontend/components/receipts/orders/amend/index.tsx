import type { ReceiptComponentProperties } from '../../receipts';
import { OrderBadges } from '../../utils/order/badges';
import { OrderTable } from '../../utils/order-table';
import { ReceiptWrapper } from '../../utils/receipt-wrapper';

export const AmendmentView = ({ amendment }: { amendment: any }) => {
  return (
    <>
      <OrderTable {...amendment} />
      <OrderBadges {...amendment} />
    </>
  );
};

export const Amendment = ({ transaction }: ReceiptComponentProperties) => {
  const amendment = transaction.orderAmendment;
  if (amendment.pegged_offset || amendment.pegged_reference) return null;
  return (
    <ReceiptWrapper>
      <AmendmentView amendment={amendment} />
    </ReceiptWrapper>
  );
};

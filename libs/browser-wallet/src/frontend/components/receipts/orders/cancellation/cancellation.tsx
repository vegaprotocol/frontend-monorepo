import { formatDateWithLocalTimezone } from '@vegaprotocol/utils';

import { useOrder } from '@/hooks/order';
import { nanoSecondsToMilliseconds } from '@/lib/utils';

import type { ReceiptComponentProperties } from '../../receipts';
import { ReceiptWrapper } from '../../utils/receipt-wrapper';
import { CancellationView } from './cancellation-view';

export const Cancellation = ({ transaction }: ReceiptComponentProperties) => {
  const cancellation = transaction.orderCancellation;
  const { orderId } = cancellation;
  const { data: order, loading, error, lastUpdated } = useOrder(orderId);
  if (loading) return null;
  return (
    <ReceiptWrapper errors={[error]}>
      <CancellationView cancellation={cancellation} order={order} />
      {order && lastUpdated && (
        <div className="text-sm text-gray-500 mt-2">
          Last Updated:{' '}
          {formatDateWithLocalTimezone(
            new Date(nanoSecondsToMilliseconds(lastUpdated))
          )}
        </div>
      )}
    </ReceiptWrapper>
  );
};

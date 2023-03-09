import { t } from '@vegaprotocol/i18n';

interface CancelSummaryProps {
  orderId?: string;
  marketId?: string;
}

/**
 * Simple component for rendering a reasonable string from an order cancellation
 */
export const CancelSummary = ({ orderId, marketId }: CancelSummaryProps) => {
  return <span className="font-bold">{getLabel(orderId, marketId)}</span>;
};

export function getLabel(
  orderId: string | undefined,
  marketId: string | undefined
): string {
  if (!orderId && !marketId) {
    return t('All orders');
  } else if (marketId && !orderId) {
    return t('All in market');
  }

  return '-';
}

import { useEnvironment } from '@vegaprotocol/environment';
import { t, truncateByChars } from '@vegaprotocol/react-helpers';
import { Link } from '@vegaprotocol/ui-toolkit';
import type { VegaTxState } from '@vegaprotocol/wallet';
import type { ClosingOrder as IClosingOrder } from '../use-close-position';
import { useRequestClosePositionData } from '../use-request-close-position-data';
import { ClosingOrder } from './shared';

interface CompleteProps {
  partyId: string;
  transaction: VegaTxState;
  order?: IClosingOrder;
}

export const Complete = ({ partyId, transaction, order }: CompleteProps) => {
  const { VEGA_EXPLORER_URL } = useEnvironment();
  const { market, marketData, orders } = useRequestClosePositionData(
    order?.marketId,
    partyId
  );

  if (!market || !marketData || !orders) {
    return <div>{t('Loading...')}</div>;
  }

  if (!order) {
    return (
      <div className="text-vega-red">{t('Could retrieve closing order')}</div>
    );
  }

  return (
    <>
      <h2 className="font-bold">{t('Position closed')}</h2>
      <ClosingOrder order={order} market={market} marketData={marketData} />
      {transaction.txHash && (
        <>
          <p className="font-semibold mt-4">{t('Transaction')}</p>
          <p>
            <Link
              href={`${VEGA_EXPLORER_URL}/txs/${transaction.txHash}`}
              target="_blank"
            >
              {truncateByChars(transaction.txHash)}
            </Link>
          </p>
        </>
      )}
    </>
  );
};

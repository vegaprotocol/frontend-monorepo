import { useEnvironment } from '@vegaprotocol/environment';
import type { OrderEventFieldsFragment } from '@vegaprotocol/orders';
import { t, truncateByChars } from '@vegaprotocol/react-helpers';
import * as Schema from '@vegaprotocol/types';
import { Link } from '@vegaprotocol/ui-toolkit';
import type { TransactionResult, VegaTxState } from '@vegaprotocol/wallet';
import type { ClosingOrder as IClosingOrder } from '../use-close-position';
import { useRequestClosePositionData } from '../use-request-close-position-data';
import { ClosingOrder } from './shared';

interface CompleteProps {
  partyId: string;
  transaction: VegaTxState;
  transactionResult?: TransactionResult;
  closingOrder?: IClosingOrder;
  closingOrderResult?: OrderEventFieldsFragment;
}

export const Complete = ({
  partyId,
  transaction,
  transactionResult,
  closingOrder,
  closingOrderResult,
}: CompleteProps) => {
  const { VEGA_EXPLORER_URL } = useEnvironment();

  if (!transactionResult || !closingOrderResult) return null;

  return (
    <>
      {closingOrderResult.status === Schema.OrderStatus.STATUS_FILLED &&
      transactionResult.status ? (
        <Success partyId={partyId} order={closingOrder} />
      ) : (
        <Error
          transactionResult={transactionResult}
          closingOrderResult={closingOrderResult}
        />
      )}
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

const Success = ({
  partyId,
  order,
}: {
  partyId: string;
  order?: IClosingOrder;
}) => {
  const { market, marketData, orders } = useRequestClosePositionData(
    order?.marketId,
    partyId
  );

  if (!market || !marketData || !orders) {
    return <div>{t('Loading...')}</div>;
  }

  if (!order) {
    return (
      <div className="text-vega-pink">{t('Could retrieve closing order')}</div>
    );
  }
  return (
    <>
      <h2 className="font-bold">{t('Position closed')}</h2>
      <ClosingOrder order={order} market={market} marketData={marketData} />
    </>
  );
};

const Error = ({
  transactionResult,
  closingOrderResult,
}: {
  transactionResult: TransactionResult;
  closingOrderResult: OrderEventFieldsFragment;
}) => {
  const reason =
    closingOrderResult.rejectionReason &&
    Schema.OrderRejectionReasonMapping[closingOrderResult.rejectionReason];
  return (
    <div className="text-vega-pink">
      {reason ? (
        <p>{reason}</p>
      ) : (
        <p>
          {t('Transaction failed')}: {transactionResult.error}
        </p>
      )}
    </div>
  );
};

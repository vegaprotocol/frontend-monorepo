import { useEnvironment } from '@vegaprotocol/environment';
import { t, truncateByChars } from '@vegaprotocol/react-helpers';
import { Link } from '@vegaprotocol/ui-toolkit';
import type { TransactionResult, VegaTxState } from '@vegaprotocol/wallet';
import type { ClosingOrder as IClosingOrder } from '../use-close-position';
import { useRequestClosePositionData } from '../use-request-close-position-data';
import { ClosingOrder } from './shared';

interface CompleteProps {
  partyId: string;
  transaction: VegaTxState;
  transactionResult?: TransactionResult;
  order?: IClosingOrder;
}

export const Complete = ({
  partyId,
  transaction,
  transactionResult,
  order,
}: CompleteProps) => {
  const { VEGA_EXPLORER_URL } = useEnvironment();

  if (!transactionResult) return null;

  return (
    <>
      {transactionResult.status ? (
        <Success partyId={partyId} order={order} />
      ) : (
        <Error transactionResult={transactionResult} />
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
      <div className="text-vega-red">{t('Could retrieve closing order')}</div>
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
}: {
  transactionResult: TransactionResult;
}) => {
  return <div className="text-vega-red">{transactionResult.error}</div>;
};

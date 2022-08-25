import { useEnvironment } from '@vegaprotocol/environment';
import {
  addDecimalsFormatNumber,
  t,
  truncateByChars,
} from '@vegaprotocol/react-helpers';
import { Button } from '@vegaprotocol/ui-toolkit';
import type { VegaTxState } from '@vegaprotocol/wallet';
import { formatDistanceToNow } from 'date-fns';
import type { WithdrawalFields } from './__generated__/WithdrawalFields';

export const WithdrawalFeedback = ({
  transaction,
  withdrawal,
  submitWithdraw,
  availableTimestamp,
}: {
  transaction: VegaTxState;
  withdrawal: WithdrawalFields | null;
  submitWithdraw: (withdrawalId: string) => void;
  availableTimestamp: number | null;
}) => {
  const { VEGA_EXPLORER_URL } = useEnvironment();
  const isAvailable =
    availableTimestamp === null || Date.now() > availableTimestamp;
  return (
    <div>
      <p className="mb-8">
        Your funds have been unlocked for withdrawal -{' '}
        <a
          className="underline"
          data-testid="tx-block-explorer"
          href={`${VEGA_EXPLORER_URL}/txs/0x${transaction.txHash}`}
          target="_blank"
          rel="noreferrer"
        >
          {t('View in block explorer')}
        </a>
      </p>
      <div className="flex gap-12 mb-12">
        {withdrawal && (
          <>
            <div>
              <p className="font-bold">Asset</p>
              <p>{withdrawal.asset.symbol}</p>
            </div>
            <div>
              <p className="font-bold">Amount</p>
              <p>
                {addDecimalsFormatNumber(
                  withdrawal.amount,
                  withdrawal.asset.decimals
                )}
              </p>
            </div>
            {withdrawal.details && (
              <div>
                <p className="font-bold">Recipient</p>
                <a
                  target="_blank"
                  href={`${VEGA_EXPLORER_URL}/address/${withdrawal.details.receiverAddress}`}
                  rel="noreferrer"
                  className="underline"
                >
                  {truncateByChars(withdrawal.details.receiverAddress)}
                </a>
              </div>
            )}
          </>
        )}
      </div>
      {isAvailable ? (
        <Button
          disabled={withdrawal === null ? true : false}
          onClick={() => {
            if (withdrawal) {
              submitWithdraw(withdrawal.id);
            }
          }}
        >
          Withdraw funds
        </Button>
      ) : (
        <p className="text-danger">
          {t(
            `Available to withdraw in ${formatDistanceToNow(
              availableTimestamp
            )}`
          )}
        </p>
      )}
    </div>
  );
};

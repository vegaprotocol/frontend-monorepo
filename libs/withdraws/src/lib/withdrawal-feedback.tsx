import { useEnvironment } from '@vegaprotocol/environment';
import {
  addDecimalsFormatNumber,
  t,
  truncateByChars,
} from '@vegaprotocol/react-helpers';
import {
  Button,
  KeyValueTable,
  KeyValueTableRow,
} from '@vegaprotocol/ui-toolkit';
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
      <p className="mb-2">
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
      {withdrawal && (
        <KeyValueTable>
          <KeyValueTableRow>
            <span>Asset</span>
            <span>{withdrawal.asset.symbol}</span>
          </KeyValueTableRow>
          <KeyValueTableRow>
            <span>Amount</span>
            <span>
              {addDecimalsFormatNumber(
                withdrawal.amount,
                withdrawal.asset.decimals
              )}
            </span>
          </KeyValueTableRow>
          {withdrawal.details && (
            <KeyValueTableRow>
              <span>Recipient</span>
              <a
                target="_blank"
                href={`${VEGA_EXPLORER_URL}/address/${withdrawal.details.receiverAddress}`}
                rel="noreferrer"
                className="underline"
              >
                {truncateByChars(withdrawal.details.receiverAddress)}
              </a>
            </KeyValueTableRow>
          )}
        </KeyValueTable>
      )}
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

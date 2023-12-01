import { useEnvironment } from '@vegaprotocol/environment';
import { addDecimalsFormatNumber, truncateByChars } from '@vegaprotocol/utils';
import {
  Button,
  KeyValueTable,
  KeyValueTableRow,
} from '@vegaprotocol/ui-toolkit';
import type { VegaTxState } from '@vegaprotocol/web3';
import { getChainName, useWeb3ConnectStore } from '@vegaprotocol/web3';
import { useWeb3React } from '@web3-react/core';
import { formatDistanceToNow } from 'date-fns';
import type { WithdrawalFieldsFragment } from './__generated__/Withdrawal';
import { useT } from './use-t';
import { Trans } from 'react-i18next';

export const WithdrawalFeedback = ({
  transaction,
  withdrawal,
  submitWithdraw,
  availableTimestamp,
}: {
  transaction: VegaTxState;
  withdrawal: WithdrawalFieldsFragment | null;
  submitWithdraw: (withdrawalId: string) => void;
  availableTimestamp: number | null;
}) => {
  const t = useT();
  const { VEGA_EXPLORER_URL } = useEnvironment();
  const isAvailable =
    availableTimestamp === null || Date.now() > availableTimestamp;

  return (
    <div>
      <p className="mb-2">
        <Trans
          defaults="Your funds have been unlocked for withdrawal - <0>View in block explorer<0>"
          components={[
            <a
              className="underline"
              data-testid="tx-block-explorer"
              href={`${VEGA_EXPLORER_URL}/txs/0x${transaction.txHash}`}
              target="_blank"
              rel="noreferrer"
            >
              View in block explorer
            </a>,
          ]}
        />
      </p>
      {withdrawal && (
        <KeyValueTable>
          <KeyValueTableRow>
            <span>{t('Asset')}</span>
            <span data-testid="withdrawal-asset-symbol">
              {withdrawal.asset.symbol}
            </span>
          </KeyValueTableRow>
          <KeyValueTableRow>
            <span>{t('Amount')}</span>
            <span data-testid="withdrawal-amount">
              {addDecimalsFormatNumber(
                withdrawal.amount,
                withdrawal.asset.decimals
              )}
            </span>
          </KeyValueTableRow>
          {withdrawal.details && (
            <KeyValueTableRow>
              <span>{t('Recipient')}</span>
              <a
                target="_blank"
                href={`${VEGA_EXPLORER_URL}/address/${withdrawal.details.receiverAddress}`}
                rel="noreferrer"
                className="underline"
                data-testid="withdrawal-recipient"
              >
                {truncateByChars(withdrawal.details.receiverAddress)}
              </a>
            </KeyValueTableRow>
          )}
        </KeyValueTable>
      )}
      {isAvailable ? (
        <ActionButton withdrawal={withdrawal} submitWithdraw={submitWithdraw} />
      ) : (
        <p className="text-danger">
          {t('Available to withdraw in {{availableTimestamp}}', {
            availableTimestamp: formatDistanceToNow(availableTimestamp),
          })}
        </p>
      )}
    </div>
  );
};

const ActionButton = ({
  withdrawal,
  submitWithdraw,
}: {
  withdrawal: WithdrawalFieldsFragment | null;
  submitWithdraw: (withdrawalId: string) => void;
}) => {
  const t = useT();
  const { isActive, chainId } = useWeb3React();
  const { open, desiredChainId } = useWeb3ConnectStore((store) => ({
    open: store.open,
    desiredChainId: store.desiredChainId,
  }));

  if (!isActive) {
    return (
      <Button onClick={() => open()}>
        {t('Connect Ethereum wallet to complete')}
      </Button>
    );
  }

  if (chainId !== desiredChainId) {
    const chainName = getChainName(chainId);
    return (
      <>
        <p className="text-danger mb-2">
          {t('This app only works on {{chainName}}. Please change chain.', {
            chainName,
          })}
        </p>
        <Button disabled={true}>{t('Withdraw funds')}</Button>
      </>
    );
  }

  return (
    <Button
      disabled={withdrawal === null ? true : false}
      data-testid="withdraw-funds"
      onClick={() => {
        if (withdrawal) {
          submitWithdraw(withdrawal.id);
        }
      }}
    >
      {t('Withdraw funds')}
    </Button>
  );
};

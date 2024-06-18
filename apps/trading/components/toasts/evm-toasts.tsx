import { Panel, ToastHeading, ProgressBar } from '@vegaprotocol/ui-toolkit';

import { useT } from '../../lib/use-t';
import { type Tx } from '../../lib/hooks/use-evm-tx';
import {
  BlockExplorerLink,
  getExternalChainShortLabel,
} from '@vegaprotocol/environment';

type Props = { tx?: Tx };

export const Requested = () => {
  const t = useT();
  return (
    <>
      <ToastHeading>{t('Action required')}</ToastHeading>
      <p>
        {t(
          'Please go to your wallet application and approve or reject the transaction.'
        )}
      </p>
    </>
  );
};

export const Pending = ({ tx }: Props) => {
  const t = useT();
  return (
    <>
      <ToastHeading>{t('Awaiting confirmation')}</ToastHeading>
      <p>{t('Please wait for your transaction to be confirmed.')}</p>
      {tx && (
        <p>
          <BlockExplorerLink sourceChainId={tx.chainId} tx={tx.hash}>
            {t('View on {{chainLabel}}', {
              chainLabel: getExternalChainShortLabel(String(tx.chainId)),
            })}
          </BlockExplorerLink>
        </p>
      )}
      <Confirmations tx={tx} />
    </>
  );
};

export const Error = ({ message }: { message?: string }) => {
  const t = useT();
  return (
    <>
      <ToastHeading>{t('Error occurred')}</ToastHeading>
      {message ? (
        <p className="first-letter:uppercase">{message}</p>
      ) : (
        <p className="first-letter:uppercase">{t('Something went wrong')}</p>
      )}
    </>
  );
};

export const ConfirmingDeposit = ({ tx }: Props) => {
  const t = useT();

  return (
    <>
      <ToastHeading>{t('Processing deposit')}</ToastHeading>
      <p>
        {t('Your transaction has been completed.')}{' '}
        {t('Waiting for deposit confirmation.')}
      </p>
      {tx && (
        <BlockExplorerLink sourceChainId={tx.chainId} tx={tx.hash}>
          {t('View on {{chainLabel}}', {
            chainLabel: getExternalChainShortLabel(String(tx.chainId)),
          })}
        </BlockExplorerLink>
      )}
    </>
  );
};

export const FinalizedGeneric = ({ tx }: Props) => {
  const t = useT();
  return (
    <>
      <ToastHeading>{t('Transaction confirmed')}</ToastHeading>
      <p>{t('Your transaction has been confirmed.')}</p>
      {tx && (
        <BlockExplorerLink sourceChainId={tx.chainId} tx={tx.hash}>
          {t('View on {{chainLabel}}', {
            chainLabel: getExternalChainShortLabel(String(tx.chainId)),
          })}
        </BlockExplorerLink>
      )}
    </>
  );
};

export const FinalizedDeposit = ({ tx }: Props) => {
  const t = useT();

  return (
    <>
      <ToastHeading>{t('Deposit complete')}</ToastHeading>
      <p>{t('Your transaction has been completed.')} </p>
      {tx && (
        <BlockExplorerLink sourceChainId={tx.chainId} tx={tx.hash}>
          {t('View on {{chainLabel}}', {
            chainLabel: getExternalChainShortLabel(String(tx.chainId)),
          })}
        </BlockExplorerLink>
      )}
    </>
  );
};

const Confirmations = ({ tx }: { tx?: Tx }) => {
  const t = useT();

  if (!tx) return null;

  if (tx.confirmations > 1) {
    return (
      <Panel>
        {tx.meta && (
          <strong>
            {tx.meta.functionName} {tx.meta.amount} {tx.meta.asset.symbol}
          </strong>
        )}
        {tx.status === 'pending' && tx.meta?.requiredConfirmations && (
          <>
            <p className="mt-[2px]">
              {t(
                'Awaiting confirmations {{confirmations}}/{{requiredConfirmations}}',
                {
                  confirmations: tx.confirmations,
                  requiredConfirmations: tx.meta.requiredConfirmations,
                }
              )}
            </p>
            <ProgressBar
              value={(tx.confirmations / tx.meta.requiredConfirmations) * 100}
            />
          </>
        )}
      </Panel>
    );
  }

  return null;
};

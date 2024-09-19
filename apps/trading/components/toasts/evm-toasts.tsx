import { Panel, ToastHeading, ProgressBar } from '@vegaprotocol/ui-toolkit';

import { useT } from '../../lib/use-t';
import { type TxDeposit, type Tx } from '../../lib/hooks/use-evm-tx';
import {
  BlockExplorerLink,
  getExternalChainLabel,
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
      {/* <Link tx={tx} /> */}
      <Confirmations tx={tx} />
    </>
  );
};

export const Approve = ({ tx }: Props) => {
  const t = useT();
  return (
    <>
      <ToastHeading>{t('Awaiting approval')}</ToastHeading>
      <p>{t('Go to your wallet and approve use of funds.')}</p>
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

export const ConfirmingDeposit = ({ tx }: { tx: TxDeposit }) => {
  const t = useT();

  return (
    <>
      <ToastHeading>{t('Processing deposit')}</ToastHeading>
      <p>
        {t('Your transaction has been completed.')}{' '}
        {t('Waiting for deposit confirmation.')}
      </p>
      {tx.depositHash && (
        <Link tx={{ chainId: tx.chainId, hash: tx.depositHash }} />
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
      {/* <Link tx={tx} /> */}
    </>
  );
};

export const FinalizedDeposit = ({ tx }: { tx: TxDeposit }) => {
  const t = useT();

  return (
    <>
      <ToastHeading>{t('Deposit complete')}</ToastHeading>
      <p>{t('Your transaction has been completed.')} </p>
      {tx.depositHash && (
        <Link tx={{ chainId: tx.chainId, hash: tx.depositHash }} />
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
        {/* {tx.meta && (
          <strong>
            {tx.meta.functionName} {tx.meta.amount} {tx.meta.asset.symbol}
          </strong>
        )} */}
        {tx.status === 'pending' && tx.requiredConfirmations && (
          <>
            <p className="mt-[2px]">
              {t(
                'Awaiting confirmations {{confirmations}}/{{requiredConfirmations}}',
                {
                  confirmations: tx.confirmations,
                  requiredConfirmations: tx.requiredConfirmations,
                }
              )}
            </p>
            <ProgressBar
              value={(tx.confirmations / tx.requiredConfirmations) * 100}
            />
          </>
        )}
      </Panel>
    );
  }

  return null;
};

const Link = ({ tx }: { tx?: { chainId: number; hash: string } }) => {
  const t = useT();

  if (!tx) return null;

  return (
    <BlockExplorerLink sourceChainId={tx.chainId} tx={tx.hash}>
      {t('View on {{chainLabel}}', {
        chainLabel: getExternalChainLabel(String(tx.chainId)),
      })}
    </BlockExplorerLink>
  );
};

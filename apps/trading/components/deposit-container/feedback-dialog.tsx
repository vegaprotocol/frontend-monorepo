import {
  Dialog,
  DialogTitle,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { type ReactNode } from 'react';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { useT } from '../../lib/use-t';
import { BlockExplorerLink } from '@vegaprotocol/environment';
import { type TxDeposit, type TxSquidDeposit } from '../../stores/evm';

import {
  ConfirmedBadge,
  DefaultBadge,
  PendingBadge,
} from '../transaction-dialog/transaction-badge';

type FeedbackDialogProps = {
  data?: TxDeposit;
  onChange: (open: boolean) => void;
};

export const FeedbackDialog = (props: FeedbackDialogProps) => {
  const t = useT();
  const txActive = Boolean(props.data && props.data.status !== 'idle');
  return (
    <Dialog open={txActive} onChange={props.onChange}>
      <DialogTitle className="sr-only">{t('Deposit')}</DialogTitle>
      {props.data && <Content tx={props.data} />}
    </Dialog>
  );
};

const Content = (props: { tx: TxDeposit }) => {
  const t = useT();
  const data = props.tx.data;

  const showSteps = data && props.tx.status !== 'error';

  return (
    <div className="flex flex-col items-start gap-4">
      <div>
        <p className="text-surface-1-fg-muted">
          {t('Deposit')} <br />
          {data && data.asset && (
            <span className="text-surface-1-fg text-2xl">
              {addDecimalsFormatNumber(data.amount, data.asset.decimals)}{' '}
              {data.asset.symbol}
            </span>
          )}
        </p>
      </div>
      <hr className="w-full" />
      {showSteps ? (
        <div className="flex flex-col gap-4 w-full">
          <FeedbackStep
            pending={
              data.approvalRequired
                ? Boolean(data.approveHash && !data.approveReceipt)
                : false
            }
            complete={
              data.approvalRequired ? Boolean(data.approveReceipt) : true
            }
          >
            <span>{t('Approve spending')}</span>
            {data.approveHash && (
              <BlockExplorerLink
                sourceChainId={props.tx.chainId}
                tx={data.approveHash}
                className="text-sm"
              >
                {t('View on explorer')}
              </BlockExplorerLink>
            )}
          </FeedbackStep>
          <FeedbackStep
            pending={Boolean(data.depositHash && !data.depositReceipt)}
            complete={Boolean(data.depositReceipt)}
          >
            <p>{t('Send deposit')}</p>
            {data.depositHash && (
              <BlockExplorerLink
                sourceChainId={props.tx.chainId}
                tx={data.depositHash}
                className="text-sm"
              >
                {t('View on explorer')}
              </BlockExplorerLink>
            )}
          </FeedbackStep>
          <FeedbackStep
            pending={Boolean(data.depositHash && data.depositReceipt)}
            complete={Boolean(props.tx.status === 'finalized')}
          >
            <p>{t('Confirm deposit')}</p>
          </FeedbackStep>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <p className="text-intent-danger">{t('Deposit failed:')}</p>
          {props.tx.error && (
            <>
              {isUserRejected(props.tx.error) ? (
                <p>{t('User rejected the transaction')}</p>
              ) : (
                <p className="break-all">{props.tx.error.message}</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

type SquidFeedbackDialogProps = {
  data?: TxSquidDeposit;
  onChange: (open: boolean) => void;
};

export const SquidFeedbackDialog = (props: SquidFeedbackDialogProps) => {
  const t = useT();
  const txActive = Boolean(props.data && props.data.status !== 'idle');
  return (
    <Dialog open={txActive} onChange={props.onChange}>
      <DialogTitle className="sr-only">{t('Swap and Deposit')}</DialogTitle>
      {props.data && <SquidContent tx={props.data} />}
    </Dialog>
  );
};

const SquidContent = (props: { tx: TxSquidDeposit }) => {
  const t = useT();
  const data = props.tx.data;

  const showSteps = data && props.tx.status !== 'error';
  const estimate = data?.routeData.route.estimate;

  return (
    <div className="flex flex-col items-start gap-4">
      <div>
        <p className="text-surface-1-fg-muted">
          {t('Deposit')} <br />
          {estimate && (
            <span className="text-surface-1-fg text-2xl">
              {addDecimalsFormatNumber(
                estimate.fromAmount,
                estimate.fromToken.decimals
              )}{' '}
              {estimate.fromToken.symbol}
            </span>
          )}
        </p>
        <p className="text-surface-1-fg-muted">
          {t('Receive')} <br />
          {estimate && (
            <span className="text-surface-1-fg text-2xl">
              {addDecimalsFormatNumber(
                estimate.toAmount,
                estimate.toToken.decimals
              )}{' '}
              {estimate.toToken.symbol}
            </span>
          )}
        </p>
      </div>
      <hr className="w-full" />
      {showSteps ? (
        <div className="flex flex-col gap-4 w-full">
          <FeedbackStep
            pending={Boolean(!data.hash)}
            complete={Boolean(data.hash)}
          >
            <span>{t('Send swap and deposit')}</span>
            {data.hash && (
              <a
                href={`https://axelarscan.io/gmp/${data.hash}`}
                className="underline underline-offset-4 flex items-center gap-1"
                target="_blank"
                rel="noreferrer"
              >
                {t('View on Axelarscan')}
                <VegaIcon name={VegaIconNames.OPEN_EXTERNAL} size={14} />
              </a>
            )}
          </FeedbackStep>
          <FeedbackStep
            pending={Boolean(data.hash && !data.receipt)}
            complete={Boolean(data.receipt)}
          >
            <p>{t('Confirm deposit')}</p>
            {props.tx.status === 'finalized' && data.receipt && (
              <p className="text-surface-0-fg-muted">
                {t(
                  'Your tokens have been swapped and deposited to the network. It may take a few minutes for your funds to appear under your public key.'
                )}
              </p>
            )}
          </FeedbackStep>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <p className="text-intent-danger">{t('Deposit failed:')}</p>
          {props.tx.error && (
            <>
              {isUserRejected(props.tx.error) ? (
                <p>{t('User rejected the transaction')}</p>
              ) : (
                <p className="break-all">{props.tx.error.message}</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

const FeedbackStep = (props: {
  pending: boolean;
  complete: boolean;
  children: ReactNode;
}) => {
  return (
    <div className="flex items-center gap-4">
      <div className="w-8 flex justify-center items-center">
        {props.complete ? (
          <ConfirmedBadge />
        ) : props.pending ? (
          <PendingBadge />
        ) : (
          <DefaultBadge />
        )}
      </div>
      <div className="grow flex flex-col gap-0.5">{props.children}</div>
    </div>
  );
};

function isUserRejected(err: unknown) {
  if (
    err !== null &&
    typeof err === 'object' &&
    'shortMessage' in err &&
    err.shortMessage === 'User rejected the request.'
  ) {
    return true;
  }
  return false;
}

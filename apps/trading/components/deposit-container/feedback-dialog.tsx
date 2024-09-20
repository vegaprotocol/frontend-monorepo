import { Dialog, VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { type ReactNode } from 'react';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { useT } from '../../lib/use-t';
import { type TxDeposit } from '../../lib/hooks/use-evm-deposit-slice';
import { BlockExplorerLink } from '@vegaprotocol/environment';
import { type TxSquidDeposit } from '../../lib/hooks/use-evm-squid-deposit-slice';

type FeedbackDialogProps = {
  data?: TxDeposit;
  onChange: (open: boolean) => void;
};

export const FeedbackDialog = (props: FeedbackDialogProps) => {
  const txActive = Boolean(props.data && props.data.status !== 'idle');
  return (
    <Dialog open={txActive} onChange={props.onChange}>
      {props.data && <Content tx={props.data} />}
    </Dialog>
  );
};

const Content = (props: { tx: TxDeposit }) => {
  const t = useT();
  const data = props.tx;

  const showSteps = data.status !== 'error';

  return (
    <div className="flex flex-col items-start gap-4">
      <div>
        <p className="text-surface-1-fg-muted">
          {t('Deposit')} <br />
          <span className="text-surface-1-fg text-2xl">
            {addDecimalsFormatNumber(data.amount, data.asset.decimals)}{' '}
            {data.asset.symbol}
          </span>
        </p>
      </div>
      <hr className="w-full" />
      {showSteps ? (
        <div className="flex flex-col gap-1 w-full">
          {data.approvalRequired && (
            <FeedbackStep
              pending={Boolean(data.approveHash && !data.approveReceipt)}
              complete={Boolean(data.approveReceipt)}
            >
              <span>{t('Approve deposit')}</span>
              {data.approveHash && (
                <BlockExplorerLink
                  sourceChainId={data.chainId}
                  tx={data.approveHash}
                >
                  {t('View on explorer')}
                </BlockExplorerLink>
              )}
            </FeedbackStep>
          )}
          <FeedbackStep
            pending={Boolean(data.depositHash && !data.depositReceipt)}
            complete={Boolean(data.depositReceipt)}
          >
            <span>
              <p>{t('Deposit')}</p>
              {data.status === 'finalized' && data.depositReceipt && (
                <p className="text-surface-0-fg-muted">
                  {t('Deposit complete')}
                </p>
              )}
            </span>
            {data.approveHash && (
              <BlockExplorerLink
                sourceChainId={data.chainId}
                tx={data.approveHash}
              >
                {t('View on explorer')}
              </BlockExplorerLink>
            )}
          </FeedbackStep>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <p className="text-intent-danger">{t('Deposit failed:')}</p>
          {data.error && (
            <>
              {isUserRejected(data.error) ? (
                <p>{t('User rejected the transaction')}</p>
              ) : (
                <p className="break-all">{data.error.message}</p>
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
  const txActive = Boolean(props.data && props.data.status !== 'idle');
  return (
    <Dialog open={txActive} onChange={props.onChange}>
      {props.data && <SquidContent tx={props.data} />}
    </Dialog>
  );
};

const SquidContent = (props: { tx: TxSquidDeposit }) => {
  const t = useT();
  const data = props.tx;

  const showSteps = data.status !== 'error';
  const estimate = data.routeData.route.estimate;

  return (
    <div className="flex flex-col items-start gap-4">
      <div>
        <p className="text-surface-1-fg-muted">
          {t('Deposit')} <br />
          <span className="text-surface-1-fg text-2xl">
            {addDecimalsFormatNumber(
              estimate.fromAmount,
              estimate.fromToken.decimals
            )}{' '}
            {estimate.fromToken.symbol}
          </span>
        </p>
        <p className="text-surface-1-fg-muted">
          {t('Receive')} <br />
          <span className="text-surface-1-fg text-2xl">
            {addDecimalsFormatNumber(
              estimate.toAmount,
              estimate.toToken.decimals
            )}{' '}
            {estimate.toToken.symbol}
          </span>
        </p>
      </div>
      <hr className="w-full" />
      {showSteps ? (
        <div className="flex flex-col gap-1 w-full">
          <FeedbackStep
            pending={Boolean(!data.hash)}
            complete={Boolean(data.hash)}
          >
            <span>{t('Confirm in wallet...')}</span>
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
            <span>
              <p>{t('Confirm swap and deposit')}</p>
              {data.status === 'finalized' && data.receipt && (
                <p className="text-surface-0-fg-muted">
                  {t(
                    'Your tokens have been swapped and deposited to the network. It may take a few minutes for your funds to appear under your public key.'
                  )}
                </p>
              )}
            </span>
          </FeedbackStep>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <p className="text-intent-danger">{t('Deposit failed:')}</p>
          {data.error && (
            <>
              {isUserRejected(data.error) ? (
                <p>{t('User rejected the transaction')}</p>
              ) : (
                <p className="break-all">{data.error.message}</p>
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
    <div className="flex items-start gap-2">
      <div className="w-4 pt-0.5 flex justify-center items-center">
        {props.complete ? (
          <VegaIcon
            name={VegaIconNames.TICK}
            className="text-intent-success"
            size={14}
          />
        ) : props.pending ? (
          <VegaIcon
            name={VegaIconNames.LOADING}
            size={16}
            className="animate-spin"
          />
        ) : (
          <span className="inline-block w-3 h-3 rounded-full border" />
        )}
      </div>
      <div className="grow flex justify-between gap-2">{props.children}</div>
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

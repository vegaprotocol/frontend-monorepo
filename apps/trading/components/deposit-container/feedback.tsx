import { VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { type ethers } from 'ethers';
import { type ReactNode } from 'react';
import { type RouteResponse } from '@0xsquid/sdk/dist/types';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { useT } from '../../lib/use-t';

type Status = 'idle' | 'pending' | 'error' | 'success';
type SwapFeedbackProps = {
  status: Status;
  error: Error | null;
  route?: RouteResponse['route'];
  transaction?: ethers.providers.TransactionResponse;
  receipt?: ethers.providers.TransactionReceipt;
  retry: () => void;
};

export const SwapFeedback = (props: SwapFeedbackProps) => {
  if (props.status === 'idle') return null;

  return (
    <div className="absolute inset-0 p-8 bg-surface-0/80 animate-fadeIn text-sm">
      <div className="relative bg-surface-1 p-6 rounded-lg">
        <button
          type="button"
          className="absolute top-0 right-0 p-3"
          onClick={props.retry}
        >
          <VegaIcon name={VegaIconNames.CROSS} size={20} />
        </button>
        <Content {...props} />
      </div>
    </div>
  );
};

const Content = (props: SwapFeedbackProps) => {
  const t = useT();

  return (
    <div className="flex flex-col items-start gap-4">
      {props.route && (
        <div>
          <p className="text-surface-1-fg-muted">
            {t('Deposit')} <br />
            <span className="text-surface-1-fg text-2xl">
              {addDecimalsFormatNumber(
                props.route.estimate.fromAmount,
                props.route.estimate.fromToken.decimals
              )}{' '}
              {props.route.estimate.fromToken.symbol}
            </span>
          </p>
          <p className="text-surface-1-fg-muted">
            {t('Receive')} <br />
            <span className="text-surface-1-fg text-2xl">
              {addDecimalsFormatNumber(
                props.route.estimate.toAmount,
                props.route.estimate.toToken.decimals
              )}{' '}
              {props.route.estimate.toToken.symbol}
            </span>
          </p>
        </div>
      )}
      <hr className="w-full" />
      {props.status === 'pending' || props.status === 'success' ? (
        <div className="flex flex-col gap-1 w-full">
          <FeedbackStep
            pending={Boolean(!props.transaction)}
            complete={Boolean(props.transaction)}
          >
            <span>{t('Confirm in wallet...')}</span>
            {props.transaction && (
              <a
                href={`https://axelarscan.io/gmp/${props.transaction.hash}`}
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
            pending={Boolean(props.transaction && !props.receipt)}
            complete={Boolean(props.receipt)}
          >
            <span>
              <p>{t('Confirm swap and deposit')}</p>
              {props.status === 'success' && props.receipt && (
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
          {props.error && (
            <>
              {isUserRejected(props.error) ? (
                <p>{t('User rejected the transaction')}</p>
              ) : (
                <p className="break-all">{props.error.message}</p>
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
    'code' in err &&
    err.code === 'ACTION_REJECTED'
  ) {
    return true;
  }
  return false;
}

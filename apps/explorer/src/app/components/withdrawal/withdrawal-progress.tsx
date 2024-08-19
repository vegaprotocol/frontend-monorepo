import { t } from '@vegaprotocol/i18n';
import type { ReactNode } from 'react';
import { Time } from '../time';
import { useExplorerWithdrawalQuery } from './__generated__/Withdrawal';

interface TxsStatsInfoProps {
  id: string;
  txStatus: number;
  className?: string;
}

const OK = 0;

/**
 * Shows a user the *current* state of a proposal. Which sound easy, but.. strap in
 * 1. Step one is the submission and acceptance of the WithdrawalSubmission. If it is not rejected, it is accepted and we can mark it as complete
 * 2. Is complete when there is a multisig bundle available to the user. This means that their funds have been moved to an account locked for
 *    withdrawal. To move out of this phase, the user (any user - but realistically the owner of the recipient address) needs to execute the withdrawal
 *    bundle on Ethereum, then we progress to.
 * 3. The funds have left the ERC20 bridge and been sent to the user. This is complete.
 *
 * There could actually be some extra complexity:
 * - If a deposit is above { asset { withdrawalThreshold } } then the multisig bundle is still produced (step 2) but cannot be submitted for a period
 *   of time. The period of time is defined on the ERC20 bridge. Attempts to submit the multisig bundle before that would be rejected.
 * - The bridge could be paused, which would cause attempts to complete step three to be rejected
 *
 * Also:
 * - 1 -> 2 is completed automatically by the system
 * - 2 -> 3 requires action from the user
 * - Any user with an Ethereum wallet can complete 2 -> 3 as above, but it will likely be the person who owns the vega public key of the source and
 *   the ethereum public key of the recipient. Whoever is looking at this page may be none of those people.
 * - This renders fine if the useExplorerWithdrawalQuery fails or returns nothing. It will render an error under the rejection if it failed to fetch
 */
export const WithdrawalProgress = ({ id, txStatus }: TxsStatsInfoProps) => {
  const { data, error } = useExplorerWithdrawalQuery({ variables: { id } });

  const step2Date = data?.withdrawal?.createdTimestamp || undefined;
  const step3Date = data?.withdrawal?.withdrawnTimestamp || undefined;

  const isStep1Complete = txStatus === OK;
  const isStep2Complete = isStep1Complete && !!step2Date;
  const isStep3Complete = isStep2Complete && !!step3Date;
  const hasApiError = !!error?.message;
  return (
    <div className="p-5 mb-12 max-w-xl">
      <div className="mx-4 p-4">
        <div className="flex items-center">
          <WithdrawalProgressIndicator
            step={isStep1Complete ? 1 : '✕'}
            isComplete={isStep1Complete}
            statusDescription={isStep1Complete ? t('Requested') : t('Rejected')}
          />
          <WithdrawalProgressSeparator isComplete={isStep1Complete} />
          <WithdrawalProgressIndicator
            step={2}
            isComplete={isStep2Complete}
            statusDescription={
              isStep2Complete ? t('Prepared') : t('Not prepared')
            }
          >
            {isStep2Complete ? (
              <Time date={step2Date} />
            ) : hasApiError ? (
              <span>{error?.message}</span>
            ) : (
              ''
            )}
          </WithdrawalProgressIndicator>
          <WithdrawalProgressSeparator isComplete={isStep3Complete} />
          <WithdrawalProgressIndicator
            step={3}
            isComplete={isStep3Complete}
            statusDescription={
              isStep3Complete ? t('Complete') : t('Not complete')
            }
          >
            {isStep3Complete ? <Time date={step3Date} /> : ''}
          </WithdrawalProgressIndicator>
        </div>
      </div>
    </div>
  );
};

const classes = {
  indicatorFailed:
    'rounded-full transition duration-500 ease-in-out h-12 w-12 py-3 border-2 border-pink-600 bg-vega-pink-600 text-center text-white font-bold leading-5',
  textFailed:
    'absolute top-0 -ml-10 text-center mt-16 w-32 text-xs font-medium uppercase text-vega-pink',
  indicatorComplete:
    'rounded-full transition duration-500 ease-in-out h-12 w-12 py-3 border-2 border-vega-green bg-vega-green text-center text-white leading-5',
  textComplete:
    'absolute top-0 -ml-10 text-center mt-16 w-32 text-xs font-medium uppercase text-vega-green',
  indicatorIncomplete:
    'rounded-full transition duration-500 ease-in-out h-12 w-12 py-3 border-2 border-gs-700 text-center leading-5',
  textIncomplete:
    'absolute top-0 -ml-10 text-center mt-16 w-32 text-xs font-medium uppercase text-surface-1-fg',
};

interface WithdrawalProgressIndicatorProps {
  step: string | number;
  isComplete: boolean;
  statusDescription: string;
  children?: ReactNode;
}

export function WithdrawalProgressIndicator({
  isComplete,
  statusDescription,
  step,
  children,
}: WithdrawalProgressIndicatorProps) {
  return (
    <div className="flex items-center relative">
      <div
        className={
          isComplete ? classes.indicatorComplete : classes.indicatorIncomplete
        }
      >
        {step}
      </div>
      <div
        className={isComplete ? classes.textComplete : classes.textIncomplete}
      >
        {statusDescription}
        <br />
        {children}
      </div>
    </div>
  );
}

interface WithdrawalProgressSeparatorProps {
  isComplete: boolean;
}

export function WithdrawalProgressSeparator({
  isComplete,
}: WithdrawalProgressSeparatorProps) {
  return (
    <div
      className={`flex-auto border-t-2 transition duration-500 ease-in-out ${
        isComplete ? 'border-vega-green' : 'border-gs-700'
      }`}
    ></div>
  );
}

export default WithdrawalProgress;

import { t } from '@vegaprotocol/react-helpers';
import { Time } from '../time';
import { useExplorerWithdrawalQuery } from './__generated__/Withdrawal';

interface TxsStatsInfoProps {
  id: string;
  txStatus: number;
  className?: string;
}

const classes = {
  indicatorFailed:
    'rounded-full transition duration-500 ease-in-out h-12 w-12 py-3 border-2 border-red-600 bg-red-600 text-center text-white font-bold leading-5',
  textFailed:
    'absolute top-0 -ml-10 text-center mt-16 w-32 text-xs font-medium uppercase text-red-600',
  indicatorComplete:
    'rounded-full transition duration-500 ease-in-out h-12 w-12 py-3 border-2 border-vega-green-dark bg-vega-green-dark text-center text-white leading-5',
  textComplete:
    'absolute top-0 -ml-10 text-center mt-16 w-32 text-xs font-medium uppercase text-vega-green-dark',
  indicatorIncomplete:
    'rounded-full transition duration-500 ease-in-out h-12 w-12 py-3 border-2 border-gray-300 text-center leading-5',
  textIncomplete:
    'absolute top-0 -ml-10 text-center mt-16 w-32 text-xs font-medium uppercase text-gray-500',
};

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
 */
export const WithdrawalProgress = ({ id, txStatus }: TxsStatsInfoProps) => {
  const { data } = useExplorerWithdrawalQuery({ variables: { id } });

  const step2Date = data?.withdrawal?.createdTimestamp || undefined;
  const step3Date = data?.withdrawal?.withdrawnTimestamp || undefined;

  return (
    <div className="p-5 mb-12 max-w-xl">
      <div className="mx-4 p-4">
        <div className="flex items-center">
          <div className="flex items-center relative">
            <div
              className={
                txStatus === 0
                  ? classes.indicatorComplete
                  : classes.indicatorFailed
              }
            >
              {txStatus === 0 ? 1 : '✕'}
            </div>
            <div
              className={
                txStatus === 0 ? classes.textComplete : classes.textFailed
              }
            >
              {txStatus === 0 ? t('Requested') : t('Rejected')}
              <br />
            </div>
          </div>
          <div
            className={`flex-auto border-t-2 transition duration-500 ease-in-out ${
              step2Date ? 'border-vega-green-dark' : 'border-gray-300'
            }`}
          ></div>
          <div className="flex items-center relative">
            <div
              className={
                step2Date
                  ? classes.indicatorComplete
                  : classes.indicatorIncomplete
              }
            >
              2
            </div>
            <div
              className={
                step2Date ? classes.textComplete : classes.textIncomplete
              }
            >
              {step2Date ? t('Prepared') : t('Not prepared')}
              <br />
              {step2Date ? <Time date={step2Date} /> : null}
            </div>
          </div>
          <div
            className={`flex-auto border-t-2 transition duration-500 ease-in-out ${
              step3Date ? 'border-vega-green-dark' : 'border-gray-300'
            }`}
          ></div>
          <div className="flex items-center relative">
            <div
              className={
                step3Date
                  ? classes.indicatorComplete
                  : classes.indicatorIncomplete
              }
            >
              3
            </div>
            <div
              className={
                step3Date ? classes.textComplete : classes.textIncomplete
              }
            >
              {step3Date ? t('Complete') : t('Not complete')}
              <br />
              {step3Date ? <Time date={step3Date} /> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

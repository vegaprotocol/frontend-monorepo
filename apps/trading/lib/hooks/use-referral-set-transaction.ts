import {
  useSimpleTransaction,
  type Options,
  type CreateReferralSet,
  type UpdateReferralSet,
} from '@vegaprotocol/wallet';
import { useStakeAvailable } from './use-stake-available';

/**
 * Manages state for creating a referral set or team
 */
export const useReferralSetTransaction = (opts?: Options) => {
  const { stakeAvailable, requiredStake, isEligible } = useStakeAvailable();

  const { status, result, error, send } = useSimpleTransaction({
    onSuccess: opts?.onSuccess,
    onError: opts?.onError,
  });

  const onSubmit = (tx: CreateReferralSet | UpdateReferralSet) => {
    send(tx);
  };

  return {
    err: error ? error : null,
    code: result ? result.id : null,
    status,
    stakeAvailable,
    requiredStake,
    onSubmit,
    isEligible,
  };
};

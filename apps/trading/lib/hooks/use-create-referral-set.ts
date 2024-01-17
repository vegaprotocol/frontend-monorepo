import {
  useSimpleTransaction,
  type CreateReferralSet,
  type Options,
} from '@vegaprotocol/wallet';
import { useStakeAvailable } from './use-stake-available';

/**
 * Manages state for creating a referral set or team
 */
export const useCreateReferralSet = (opts?: Options) => {
  const { stakeAvailable, requiredStake, isEligible } = useStakeAvailable();

  const { status, result, error, send } = useSimpleTransaction({
    onSuccess: opts?.onSuccess,
    onError: opts?.onError,
  });

  const onSubmit = (tx: CreateReferralSet) => {
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

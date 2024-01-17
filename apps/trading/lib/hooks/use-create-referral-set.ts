import {
  determineId,
  useVegaWallet,
  type CreateReferralSet,
} from '@vegaprotocol/wallet';
import { useState } from 'react';
import { useStakeAvailable } from './use-stake-available';

/**
 * Manages state for creating a referral set or team
 */
export const useCreateReferralSet = (opts?: {
  onSuccess?: (code: string) => void;
  onError?: (error: string) => void;
}) => {
  const { pubKey, isReadOnly, sendTx } = useVegaWallet();
  const [err, setErr] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');

  const { stakeAvailable, requiredStake, isEligible } = useStakeAvailable();

  const onSubmit = (tx: CreateReferralSet) => {
    if (isReadOnly || !pubKey) {
      setErr('Not connected');
    } else {
      setErr(null);
      setStatus('loading');
      setCode(null);
      sendTx(pubKey, tx)
        .then((res) => {
          if (!res) {
            throw new Error(`Invalid response: ${JSON.stringify(res)}`);
          }
          const code = determineId(res.signature);
          setCode(code);
          setStatus('success');
          opts?.onSuccess && opts.onSuccess(code);
        })
        .catch((err) => {
          if (err.message.includes('user rejected')) {
            setStatus('idle');
            return;
          }
          setStatus('error');
          setErr(err.message);
          opts?.onError && opts.onError(err.message);
        });
    }
  };

  return {
    err,
    code,
    status,
    stakeAvailable,
    requiredStake,
    onSubmit,
    isEligible,
  };
};

import { useCallback, useState } from 'react';
import { captureException } from '@sentry/react';
import type { WithdrawalFields } from './__generated__/WithdrawalFields';
import BigNumber from 'bignumber.js';
import { addDecimal, getDateTimeFormat, t } from '@vegaprotocol/react-helpers';
import { useGetWithdrawThreshold } from './use-get-withdraw-threshold';
import { useGetWithdrawDelay } from './use-get-withdraw-delay';
import { ERC20_APPROVAL_QUERY } from './queries';
import type {
  Erc20Approval,
  Erc20ApprovalVariables,
} from './__generated__/Erc20Approval';
import { useApolloClient } from '@apollo/client';

export enum ApprovalStatus {
  Idle = 'Idle',
  AssetInvalid = 'AssetInvalid',
  Pending = 'Pending',
  Delayed = 'Delayed',
  NoApproval = 'NoApproval',
  NoSig = 'NoSig',
  Ready = 'Ready',
}

export const useVerifyWithdrawal = () => {
  const client = useApolloClient();
  const getThreshold = useGetWithdrawThreshold();
  const getDelay = useGetWithdrawDelay();
  const [status, setStatus] = useState<ApprovalStatus>(ApprovalStatus.Idle);
  const [message, setMessage] = useState('');

  const reset = useCallback(() => {
    setStatus(ApprovalStatus.Idle);
    setMessage('');
  }, []);

  const verify = useCallback(
    async (withdrawal: WithdrawalFields) => {
      try {
        if (withdrawal.asset.source.__typename !== 'ERC20') {
          setStatus(ApprovalStatus.AssetInvalid);
          setMessage(
            t(`Invalid asset source: ${withdrawal.asset.source.__typename}`)
          );
          return false;
        }

        setStatus(ApprovalStatus.Pending);
        setMessage('Verifying withdrawal approval');

        const amount = new BigNumber(
          addDecimal(withdrawal.amount, withdrawal.asset.decimals)
        );

        const threshold = await getThreshold(withdrawal.asset);

        if (threshold && amount.isGreaterThan(threshold)) {
          const delaySecs = await getDelay();
          const completeTimestamp =
            new Date(withdrawal.createdTimestamp).getTime() + delaySecs * 1000;

          if (Date.now() < completeTimestamp) {
            const formattedTime = getDateTimeFormat().format(
              new Date(completeTimestamp)
            );
            setStatus(ApprovalStatus.Delayed);
            setMessage(
              t(
                `Withdrawal amount of ${amount.toString()} incurs a delay and cannot be completed until: ${formattedTime}`
              )
            );
            return false;
          }
        }

        const res = await client.query<Erc20Approval, Erc20ApprovalVariables>({
          query: ERC20_APPROVAL_QUERY,
          variables: { withdrawalId: withdrawal.id },
        });

        const approval = res.data.erc20WithdrawalApproval;
        if (!approval) {
          setStatus(ApprovalStatus.NoApproval);
          setMessage(t('Approval not created yet'));
          return false;
        }

        if (approval.signatures.length < 3) {
          setStatus(ApprovalStatus.NoSig);
          setMessage(t('Not enough signatures yet'));
          return false;
        }

        setStatus(ApprovalStatus.Ready);
        return true;
      } catch (err) {
        captureException(err);
        setMessage('Something went wrong');
        return false;
      }
    },
    [getThreshold, getDelay, client]
  );

  return { verify, status, message, reset };
};

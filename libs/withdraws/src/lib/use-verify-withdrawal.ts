import { useCallback, useState } from 'react';
import { captureException } from '@sentry/react';
import BigNumber from 'bignumber.js';
import { addDecimal, t } from '@vegaprotocol/react-helpers';
import {
  useGetWithdrawThreshold,
  useGetWithdrawDelay,
} from '@vegaprotocol/web3';
import type { WithdrawalFieldsFragment } from './__generated__/Withdrawal';
import { Erc20ApprovalDocument } from './__generated__/Erc20Approval';
import type {
  Erc20ApprovalQuery,
  Erc20ApprovalQueryVariables,
} from './__generated__/Erc20Approval';
import { useApolloClient } from '@apollo/client';

export enum ApprovalStatus {
  Idle = 'Idle',
  Pending = 'Pending',
  Delayed = 'Delayed',
  Error = 'Error',
  Ready = 'Ready',
}

export interface VerifyState {
  status: ApprovalStatus;
  message?: string;
  threshold?: BigNumber;
  completeTimestamp?: number | null;
  dialogOpen?: boolean;
}

const initialState = {
  status: ApprovalStatus.Idle,
  message: '',
  threshold: new BigNumber(Infinity),
  completeTimestamp: null,
  dialogOpen: false,
};

export const useVerifyWithdrawal = () => {
  const client = useApolloClient();
  const getThreshold = useGetWithdrawThreshold();
  const getDelay = useGetWithdrawDelay();
  const [state, _setState] = useState<VerifyState>(initialState);

  const setState = useCallback(
    (update: Partial<VerifyState>) => {
      _setState((curr) => ({
        ...curr,
        ...update,
      }));
    },
    [_setState]
  );

  const reset = useCallback(() => {
    setState(initialState);
  }, [setState]);

  const verify = useCallback(
    async (withdrawal: WithdrawalFieldsFragment) => {
      try {
        setState({ dialogOpen: true });

        if (withdrawal.asset.source.__typename !== 'ERC20') {
          setState({
            status: ApprovalStatus.Error,
            message: t(
              `Invalid asset source: ${withdrawal.asset.source.__typename}`
            ),
          });
          return false;
        }

        setState({
          status: ApprovalStatus.Pending,
          message: t('Verifying withdrawal approval'),
        });

        const amount = new BigNumber(
          addDecimal(withdrawal.amount, withdrawal.asset.decimals)
        );

        const threshold = await getThreshold(withdrawal.asset);

        if (threshold && amount.isGreaterThan(threshold)) {
          const delaySecs = await getDelay();
          const completeTimestamp =
            new Date(withdrawal.createdTimestamp).getTime() + delaySecs * 1000;

          if (Date.now() < completeTimestamp) {
            setState({
              status: ApprovalStatus.Delayed,
              threshold,
              completeTimestamp,
            });
            return false;
          }
        }

        const res = await client.query<
          Erc20ApprovalQuery,
          Erc20ApprovalQueryVariables
        >({
          query: Erc20ApprovalDocument,
          variables: { withdrawalId: withdrawal.id },
        });

        const approval = res.data.erc20WithdrawalApproval;
        if (!approval) {
          setState({
            status: ApprovalStatus.Error,
          });
          return false;
        }

        if (approval.signatures.length < 3) {
          setState({
            status: ApprovalStatus.Error,
          });
          return false;
        }

        setState({ status: ApprovalStatus.Ready, dialogOpen: false });

        return true;
      } catch (err) {
        captureException(err);
        setState({
          status: ApprovalStatus.Error,
        });
        return false;
      }
    },
    [getThreshold, getDelay, client, setState]
  );

  return { verify, state, reset };
};

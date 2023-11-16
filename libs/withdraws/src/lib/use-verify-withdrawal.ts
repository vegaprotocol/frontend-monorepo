import { useCallback, useState } from 'react';
import BigNumber from 'bignumber.js';
import { addDecimal } from '@vegaprotocol/utils';
import { localLoggerFactory } from '@vegaprotocol/logger';
import {
  ApprovalStatus,
  useGetWithdrawDelay,
  useGetWithdrawThreshold,
} from '@vegaprotocol/web3';
import { type WithdrawalFieldsFragment } from './__generated__/Withdrawal';
import {
  Erc20ApprovalDocument,
  type Erc20ApprovalQuery,
  type Erc20ApprovalQueryVariables,
} from './__generated__/Erc20Approval';
import { useApolloClient } from '@apollo/client';
import { useT } from './use-t';

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
  const t = useT();
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
      const logger = localLoggerFactory({ application: 'withdraws' });
      try {
        logger.info('verify withdrawal', withdrawal);
        setState({ dialogOpen: true });

        if (withdrawal.asset.source.__typename !== 'ERC20') {
          setState({
            status: ApprovalStatus.Error,
            message: t(`Invalid asset source: {{source}}`, {
              source: withdrawal.asset.source.__typename,
            }),
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
          if (delaySecs != null) {
            const completeTimestamp =
              new Date(withdrawal.createdTimestamp).getTime() +
              delaySecs * 1000;

            if (Date.now() < completeTimestamp) {
              setState({
                status: ApprovalStatus.Delayed,
                threshold,
                completeTimestamp,
              });
              return false;
            }
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
        logger.error('use verify withdrawal', err);
        setState({
          status: ApprovalStatus.Error,
        });
        return false;
      }
    },
    [getThreshold, getDelay, client, setState, t]
  );

  return { verify, state, reset };
};

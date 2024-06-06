import { useEffect, useRef, useState } from 'react';
import type { WithdrawalFieldsFragment } from '@vegaprotocol/withdraws';
import { DAY, getDateTimeFormat, getTimeFormat } from '@vegaprotocol/utils';
import { WithdrawalStatusMapping } from '@vegaprotocol/types';
import {
  ApprovalStatus,
  useEthWithdrawApprovalsStore,
  useGetWithdrawDelay,
  useGetWithdrawThreshold,
} from '@vegaprotocol/web3';

import { useT } from '../../lib/use-t';
import type { RowWithdrawal } from './asset-activity';

export const WithdrawalStatusCell = ({ data }: { data: RowWithdrawal }) => {
  if (!data.detail.txHash) {
    return <WithdrawalStatusOpen data={data} />;
  }

  return <>{WithdrawalStatusMapping[data.detail.status]}</>;
};

const WithdrawalStatusOpen = ({ data }: { data: RowWithdrawal }) => {
  const { status, readyAt } = useWithdrawalStatus({
    withdrawal: data.detail,
  });

  if (status === ApprovalStatus.Idle) {
    return null;
  }

  if (status === ApprovalStatus.Delayed) {
    const showDate = readyAt && readyAt.getTime() > Date.now() + DAY;

    return (
      <>
        {status} until{' '}
        {showDate
          ? getDateTimeFormat().format(readyAt)
          : getTimeFormat().format(readyAt)}
      </>
    );
  }

  if (status === ApprovalStatus.Ready) {
    return <WithdrawalStatusReady withdrawal={data.detail} />;
  }

  return <>{status}</>;
};

const WithdrawalStatusReady = ({
  withdrawal,
}: {
  withdrawal: WithdrawalFieldsFragment;
}) => {
  const t = useT();
  const createWithdrawApproval = useEthWithdrawApprovalsStore(
    (store) => store.create
  );

  return (
    <>
      {ApprovalStatus.Pending}
      {' | '}
      <button
        onClick={() => createWithdrawApproval(withdrawal)}
        className="underline underline-offset-4"
      >
        {t('Complete')}
      </button>
    </>
  );
};

const useWithdrawalStatus = ({
  withdrawal,
}: {
  withdrawal: WithdrawalFieldsFragment;
}) => {
  const [status, setStatus] = useState<ApprovalStatus>(ApprovalStatus.Idle);
  const [readyAt, setReadyAt] = useState<Date>();
  const getThreshold = useGetWithdrawThreshold();
  const getDelay = useGetWithdrawDelay();
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Checks if withdrawal is ready for completion and if it isn't
    // starts a time to check again after the delay time has passed
    const checkStatus = async () => {
      const threshold = await getThreshold(withdrawal.asset);

      if (threshold) {
        const delaySecs = await getDelay();

        if (delaySecs) {
          const readyTimestamp =
            new Date(withdrawal.createdTimestamp).getTime() +
            (delaySecs + 3) * 1000; // add a buffer of 3 seconds
          const now = Date.now();
          setReadyAt(new Date(readyTimestamp));

          if (now < readyTimestamp) {
            setStatus(ApprovalStatus.Delayed);

            // Check again when delay time has passed
            timeoutRef.current = setTimeout(checkStatus, readyTimestamp - now);
          } else {
            setStatus(ApprovalStatus.Ready);
          }
        }
      }
    };

    checkStatus();

    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, [getThreshold, getDelay, withdrawal]);

  return { status, readyAt };
};

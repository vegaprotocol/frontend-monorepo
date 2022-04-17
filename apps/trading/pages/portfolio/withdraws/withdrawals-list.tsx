import {
  formatNumber,
  getDateTimeFormat,
  t,
  truncateByChars,
  EthTxStatus,
} from '@vegaprotocol/react-helpers';
import { WithdrawalStatus } from '@vegaprotocol/types';
import {
  AnchorButton,
  Button,
  EtherscanLink,
  TransactionDialog,
} from '@vegaprotocol/ui-toolkit';
import { useCompleteWithdraw } from '@vegaprotocol/withdraws';
import orderBy from 'lodash/orderBy';
import { useEffect, useMemo } from 'react';
import type { WithdrawsPage_party_withdrawals } from './__generated__/WithdrawsPage';

interface WithdrawalsListProps {
  withdrawals: WithdrawsPage_party_withdrawals[];
  refetchWithdrawals: () => void;
}

export const WithdrawalsList = ({
  withdrawals,
  refetchWithdrawals,
}: WithdrawalsListProps) => {
  const { transaction, submit } = useCompleteWithdraw();

  const sortedWithdrawals = useMemo(() => {
    return orderBy(
      withdrawals,
      (w) => {
        return new Date(w.createdTimestamp).getTime();
      },
      'desc'
    );
  }, [withdrawals]);

  // TODO: Get this working, sometimes the table doesnt update because we have to
  // deal with the delay whilst Vega picks up on the completed Ethereum transaction
  useEffect(() => {
    if (transaction.status === EthTxStatus.Complete) {
      refetchWithdrawals();
    }
  }, [transaction.status, refetchWithdrawals]);

  if (!sortedWithdrawals.length) {
    return <p>No pending withdrawals</p>;
  }

  return (
    <>
      <table className="w-full mb-24">
        <thead>
          <tr>
            <th className="text-left">Amount</th>
            <th className="text-left">Recepient</th>
            <th className="text-left">Status</th>
            <th className="text-left">Created at</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {sortedWithdrawals.map((w) => {
            return <WithdrawRow key={w.id} withdraw={w} onComplete={submit} />;
          })}
        </tbody>
      </table>
      <div className="flex justify-end">
        <AnchorButton href="/portfolio/withdraws/create">
          Create new withdrawal
        </AnchorButton>
      </div>
      <TransactionDialog name="withdraw" {...transaction} />
    </>
  );
};

interface WithdrawRowProps {
  withdraw: WithdrawsPage_party_withdrawals;
  onComplete: (withdrawalId: string) => Promise<void>;
}

const WithdrawRow = ({ withdraw, onComplete }: WithdrawRowProps) => {
  const isComplete =
    withdraw.status === WithdrawalStatus.Finalized && withdraw.txHash;

  const renderStatus = () => {
    if (withdraw.status === WithdrawalStatus.Finalized) {
      if (withdraw.txHash) {
        return (
          <>
            {t('Complete')}{' '}
            <EtherscanLink tx={withdraw.txHash} text={t('View on Etherscan')} />
          </>
        );
      } else {
        return t('Ready');
      }
    }

    return withdraw.status;
  };

  return (
    <tr key={withdraw.id}>
      <td>
        {formatNumber(withdraw.amount, withdraw.asset.decimals)}{' '}
        {withdraw.asset.symbol}
      </td>
      <td>
        {withdraw.details?.__typename === 'Erc20WithdrawalDetails' ? (
          <EtherscanLink
            address={withdraw.details?.receiverAddress}
            text={truncateByChars(withdraw.details.receiverAddress)}
          />
        ) : null}
      </td>
      <td>{renderStatus()}</td>
      <td>{getDateTimeFormat().format(new Date(withdraw.createdTimestamp))}</td>
      <td className="text-right">
        {!isComplete && (
          <Button
            variant="inline-link"
            onClick={() => {
              onComplete(withdraw.id);
            }}
          >
            Complete
          </Button>
        )}
      </td>
    </tr>
  );
};

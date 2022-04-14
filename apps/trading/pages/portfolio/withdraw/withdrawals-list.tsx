import { formatNumber, getDateTimeFormat } from '@vegaprotocol/react-helpers';
import { AnchorButton, Button, EtherscanLink } from '@vegaprotocol/ui-toolkit';
import type { WithdrawPage_party_withdrawals } from './__generated__/WithdrawPage';

interface WithdrawalsListProps {
  withdrawals: WithdrawPage_party_withdrawals[];
}

export const WithdrawalsList = ({ withdrawals }: WithdrawalsListProps) => {
  if (!withdrawals.length) {
    return <p>No pending withdrawals</p>;
  }

  return (
    <div>
      <table className="w-full mb-24">
        <thead>
          <tr>
            <th className="text-left">Amount</th>
            <th className="text-left">Recepient</th>
            <th className="text-left">Created at</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {withdrawals.map((w) => {
            return (
              <tr key={w.id}>
                <td>
                  {formatNumber(w.amount, w.asset.decimals)} {w.asset.symbol}
                </td>
                <td>
                  {w.details?.__typename === 'Erc20WithdrawalDetails' ? (
                    <EtherscanLink address={w.details?.receiverAddress} />
                  ) : null}
                </td>
                <td>
                  {getDateTimeFormat().format(new Date(w.createdTimestamp))}
                </td>
                <td className="text-right">
                  <Button variant="inline-link">Complete</Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="flex justify-end">
        <AnchorButton href="/portfolio/withdraw">
          Create new withdrawal
        </AnchorButton>
      </div>
    </div>
  );
};

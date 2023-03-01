import { Tooltip } from '@vegaprotocol/ui-toolkit';
import type { ReactNode } from 'react';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import type { Market, MarketData } from '@vegaprotocol/market-list';
import {
  getFeeDetailsValues,
  useFeeDealTicketDetails,
} from '../../hooks/use-fee-deal-ticket-details';

interface DealTicketFeeDetailsProps {
  order: OrderSubmissionBody['orderSubmission'];
  market: Market;
  marketData: MarketData;
  margin: string;
  totalMargin: string;
  balance: string;
}

export interface DealTicketFeeDetailProps {
  label: string;
  value?: string | number | null;
  labelDescription?: string | ReactNode;
  symbol?: string;
}

export const DealTicketFeeDetail = ({
  label,
  value,
  labelDescription,
  symbol,
}: DealTicketFeeDetailProps) => (
  <div className="text-xs mt-2 flex justify-between items-center gap-4 flex-wrap">
    <div>
      <Tooltip description={labelDescription}>
        <div>{label}</div>
      </Tooltip>
    </div>
    <div className="text-neutral-500 dark:text-neutral-300">{`${value ?? '-'} ${
      symbol || ''
    }`}</div>
  </div>
);

export const DealTicketFeeDetails = ({
  order,
  market,
  marketData,
  margin,
  totalMargin,
  balance,
}: DealTicketFeeDetailsProps) => {
  const feeDetails = useFeeDealTicketDetails(order, market, marketData);
  const details = getFeeDetailsValues({
    ...feeDetails,
    margin,
    totalMargin,
    balance,
  });
  return (
    <div>
      {details.map((detail) => (
        <DealTicketFeeDetail {...detail} key={detail.label} />
      ))}
    </div>
  );
};

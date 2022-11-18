import { Tooltip } from '@vegaprotocol/ui-toolkit';

import type { ReactNode } from 'react';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import type { DealTicketMarketFragment } from './__generated__/DealTicket';
import {
  getFeeDetailsValues,
  useFeeDealTicketDetails,
} from '../../hooks/use-fee-deal-ticket-details';

interface DealTicketFeeDetailsProps {
  order: OrderSubmissionBody['orderSubmission'];
  market: DealTicketMarketFragment;
}

export interface DealTicketFeeDetails {
  label: string;
  value?: string | number | null;
  labelDescription?: string | ReactNode;
  quoteName?: string;
}

export const DealTicketFeeDetails = ({
  order,
  market,
}: DealTicketFeeDetailsProps) => {
  const feeDetails = useFeeDealTicketDetails(order, market);
  const details = getFeeDetailsValues(feeDetails);
  return (
    <div>
      {details.map(({ label, value, labelDescription, quoteName }) => (
        <div
          key={label}
          className="text-xs mt-2 flex justify-between items-center gap-4 flex-wrap"
        >
          <div>
            <Tooltip description={labelDescription}>
              <div>{label}</div>
            </Tooltip>
          </div>
          <div className="text-neutral-500 dark:text-neutral-300">{`${
            value ?? '-'
          } ${quoteName || ''}`}</div>
        </div>
      ))}
    </div>
  );
};

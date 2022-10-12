import { Tooltip } from '@vegaprotocol/ui-toolkit';
import type { ReactNode } from 'react';

interface DealTicketFeeDetailsProps {
  details: DealTicketFeeDetails[];
}

export interface DealTicketFeeDetails {
  label: string;
  value?: string | number | null;
  labelDescription?: string | ReactNode;
  quoteName?: string;
}

export const DealTicketFeeDetails = ({
  details,
}: DealTicketFeeDetailsProps) => {
  return (
    <div>
      {details.map(({ label, value, labelDescription, quoteName }) => (
        <div
          key={label}
          className="text-sm mt-2 flex justify-between items-center gap-4 flex-wrap"
        >
          <div>
            <Tooltip description={labelDescription}>
              <div>{label}</div>
            </Tooltip>
          </div>
          <div>{`${value ?? '-'} ${quoteName || ''}`}</div>
        </div>
      ))}
    </div>
  );
};

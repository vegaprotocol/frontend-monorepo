import { Tooltip } from '@vegaprotocol/ui-toolkit';
import classnames from 'classnames';
import type { ReactNode } from 'react';
import { getFeeDetailsValues } from '../../hooks/use-fee-deal-ticket-details';
import type { FeeDetails } from '../../hooks/use-fee-deal-ticket-details';

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

export const DealTicketFeeDetails = (props: FeeDetails) => {
  const details = getFeeDetailsValues(props);
  return (
    <div>
      {details.map(
        ({
          label,
          value,
          labelDescription,
          symbol,
          indent,
          formattedValue,
        }) => (
          <div
            key={typeof label === 'string' ? label : 'value-dropdown'}
            className={classnames(
              'text-xs mt-2 flex justify-between items-center gap-4 flex-wrap',
              { 'ml-2': indent }
            )}
          >
            <div>
              <Tooltip description={labelDescription}>
                <div>{label}</div>
              </Tooltip>
            </div>
            <Tooltip description={`${value ?? '-'} ${symbol || ''}`}>
              <div className="text-neutral-500 dark:text-neutral-300">{`${
                formattedValue ?? '-'
              } ${symbol || ''}`}</div>
            </Tooltip>
          </div>
        )
      )}
    </div>
  );
};

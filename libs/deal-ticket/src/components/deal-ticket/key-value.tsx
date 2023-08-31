import { Tooltip } from '@vegaprotocol/ui-toolkit';
import classnames from 'classnames';
import type { ReactNode } from 'react';

export interface KeyValuePros {
  label: string;
  value?: string | null | undefined;
  symbol: string;
  indent?: boolean | undefined;
  labelDescription?: ReactNode;
  formattedValue?: string;
  onClick?: () => void;
}

export const KeyValue = ({
  label,
  value,
  labelDescription,
  symbol,
  indent,
  onClick,
  formattedValue,
}: KeyValuePros) => {
  const displayValue = `${formattedValue ?? '-'} ${symbol || ''}`;
  const valueElement = onClick ? (
    <button onClick={onClick} className="text-muted">
      {displayValue}
    </button>
  ) : (
    <div className="text-muted">{displayValue}</div>
  );
  return (
    <div
      data-testid={
        'deal-ticket-fee-' + label.toLocaleLowerCase().replace(/\s/g, '-')
      }
      key={typeof label === 'string' ? label : 'value-dropdown'}
      className={classnames(
        'text-xs mt-2 flex justify-between items-center gap-4 flex-wrap',
        { 'ml-2': indent }
      )}
    >
      <Tooltip description={labelDescription}>
        <div>{label}</div>
      </Tooltip>
      <Tooltip description={`${value ?? '-'} ${symbol || ''}`}>
        {valueElement}
      </Tooltip>
    </div>
  );
};

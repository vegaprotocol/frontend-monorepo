import { Tooltip } from '@vegaprotocol/ui-toolkit';
import type { ReactNode } from 'react';

export interface KeyValuePros {
  id?: string;
  label: ReactNode;
  value?: ReactNode;
  symbol?: string;
  indent?: boolean | undefined;
  labelDescription?: ReactNode;
  formattedValue?: ReactNode;
  onClick?: () => void;
}

export const KeyValue = ({
  id,
  label,
  value,
  labelDescription,
  symbol,
  onClick,
  formattedValue,
}: KeyValuePros) => {
  const displayValue = (
    <>
      {formattedValue || '-'} {symbol || ''}
    </>
  );

  const valueElement = onClick ? (
    <button type="button" onClick={onClick} className="font-mono ml-auto">
      {displayValue}
    </button>
  ) : (
    <div className="font-mono ml-auto">{displayValue}</div>
  );

  return (
    <div
      data-testid={`deal-ticket-fee-${
        !id && typeof label === 'string'
          ? label.toLocaleLowerCase().replace(/\s/g, '-')
          : id
      }`}
      key={typeof label === 'string' ? label : 'value-dropdown'}
      className="text-xs flex justify-between items-center gap-4 flex-wrap text-right"
    >
      <Tooltip description={labelDescription}>
        <div className="text-muted text-left">{label}</div>
      </Tooltip>
      <Tooltip description={value && `${value} ${symbol || ''}`}>
        {valueElement}
      </Tooltip>
    </div>
  );
};

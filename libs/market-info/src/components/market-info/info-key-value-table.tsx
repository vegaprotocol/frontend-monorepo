import {
  addDecimalsFormatNumber,
  formatNumber,
  formatNumberPercentage,
  t,
} from '@vegaprotocol/react-helpers';
import {
  KeyValueTable,
  KeyValueTableRow,
  Tooltip,
} from '@vegaprotocol/ui-toolkit';
import BigNumber from 'bignumber.js';
import startCase from 'lodash/startCase';

import { tooltipMapping } from './tooltip-mapping';

import type { ReactNode } from 'react';
interface RowProps {
  field: string;
  value: unknown;
  decimalPlaces?: number;
  asPercentage?: boolean;
  unformatted?: boolean;
  assetSymbol?: string;
}

const Row = ({
  field,
  value,
  decimalPlaces,
  asPercentage,
  unformatted,
  assetSymbol = '',
}: RowProps) => {
  const className = 'text-black dark:text-white text-ui !px-0 !font-normal';

  const getFormattedValue = (value: unknown) => {
    if (typeof value !== 'string' && typeof value !== 'number') return null;
    if (unformatted || isNaN(Number(value))) {
      return value;
    }
    if (decimalPlaces) {
      return `${parseFloat(
        addDecimalsFormatNumber(value, decimalPlaces)
      )} ${assetSymbol}`;
    }
    if (asPercentage) {
      return formatNumberPercentage(new BigNumber(value).times(100));
    }
    return `${formatNumber(Number(value))} ${assetSymbol}`;
  };

  const formattedValue: string | number | null = getFormattedValue(value);

  if (!formattedValue) return null;
  return (
    <KeyValueTableRow
      key={field}
      inline={true}
      noBorder={true}
      dtClassName={className}
      ddClassName={className}
    >
      <Tooltip description={tooltipMapping[field]} align="start">
        <div tabIndex={-1}>{startCase(t(field))}</div>
      </Tooltip>
      <span style={{ wordBreak: 'break-word' }}>{formattedValue}</span>
    </KeyValueTableRow>
  );
};

export interface MarketInfoTableProps {
  data: unknown;
  decimalPlaces?: number;
  asPercentage?: boolean;
  unformatted?: boolean;
  omits?: string[];
  children?: ReactNode;
  assetSymbol?: string;
}

export const MarketInfoTable = ({
  data,
  decimalPlaces,
  asPercentage,
  unformatted,
  omits = ['__typename'],
  children,
  assetSymbol,
}: MarketInfoTableProps) => {
  if (!data || typeof data !== 'object') {
    return null;
  }
  return (
    <>
      <KeyValueTable>
        {Object.entries(data)
          .filter(([key]) => !omits.includes(key))
          .map(([key, value]) => (
            <Row
              key={key}
              field={key}
              value={value}
              decimalPlaces={decimalPlaces}
              assetSymbol={assetSymbol}
              asPercentage={asPercentage}
              unformatted={unformatted || key.toLowerCase().includes('volume')}
            />
          ))}
      </KeyValueTable>
      <div className="flex flex-col gap-2">{children}</div>
    </>
  );
};

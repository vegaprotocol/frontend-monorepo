import {
  t,
  addDecimalsFormatNumber,
  formatNumberPercentage,
  formatNumber,
} from '@vegaprotocol/react-helpers';
import {
  KeyValueTableRow,
  KeyValueTable,
  Tooltip,
} from '@vegaprotocol/ui-toolkit';
import BigNumber from 'bignumber.js';
import startCase from 'lodash/startCase';
import type { ReactNode } from 'react';
import { tooltipMapping } from './tooltip-mapping';

interface RowProps {
  field: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
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
  const isNumber = typeof value === 'number' || !isNaN(Number(value));
  const isPrimitive = typeof value === 'string' || isNumber;
  const className = 'text-black dark:text-white text-ui !px-0 !font-normal';
  let formattedValue = value;
  if (isNumber && !unformatted) {
    if (decimalPlaces) {
      formattedValue = `${addDecimalsFormatNumber(
        value,
        decimalPlaces
      )} ${assetSymbol}`;
    } else if (asPercentage && value) {
      formattedValue = formatNumberPercentage(new BigNumber(value).times(100));
    } else {
      formattedValue = `${formatNumber(Number(value))} ${assetSymbol}`;
    }
  }
  if (isPrimitive) {
    return (
      <KeyValueTableRow
        key={field}
        inline={isPrimitive}
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
  }
  return null;
};

export interface MarketInfoTableProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  decimalPlaces?: number;
  asPercentage?: boolean;
  unformatted?: boolean;
  omits?: string[];
  link?: ReactNode;
  assetSymbol?: string;
}

export const MarketInfoTable = ({
  data,
  decimalPlaces,
  asPercentage,
  unformatted,
  omits = ['__typename'],
  link,
  assetSymbol,
}: MarketInfoTableProps) => {
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
      {link}
    </>
  );
};

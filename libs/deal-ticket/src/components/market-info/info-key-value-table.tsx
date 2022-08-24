/* eslint-disable @typescript-eslint/no-explicit-any */
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
import omit from 'lodash/omit';
import startCase from 'lodash/startCase';
import type { ReactNode } from 'react';
import { tooltipMapping } from './tooltip-mapping';

interface RowProps {
  field: string;
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
  if (isPrimitive) {
    return (
      <KeyValueTableRow
        key={field}
        inline={isPrimitive}
        muted={true}
        noBorder={true}
        dtClassName={className}
        ddClassName={className}
      >
        <Tooltip description={tooltipMapping[field]} align="start">
          <div tabIndex={-1}>{startCase(t(field))}</div>
        </Tooltip>
        {isNumber && !unformatted
          ? decimalPlaces
            ? `${addDecimalsFormatNumber(value, decimalPlaces)} ${assetSymbol}`
            : asPercentage
            ? formatNumberPercentage(new BigNumber(value * 100))
            : `${formatNumber(Number(value))} ${assetSymbol}`
          : value}
      </KeyValueTableRow>
    );
  }
  return null;
};

export interface MarketInfoTableProps {
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
      <KeyValueTable muted={true}>
        {Object.entries(omit(data, ...omits) || []).map(([key, value]) => (
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

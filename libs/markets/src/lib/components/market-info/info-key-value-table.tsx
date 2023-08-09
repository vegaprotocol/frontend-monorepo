import {
  addDecimalsFormatNumber,
  formatNumberPercentage,
} from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import {
  Intent,
  KeyValueTable,
  KeyValueTableRow,
  Lozenge,
  Tooltip,
} from '@vegaprotocol/ui-toolkit';
import BigNumber from 'bignumber.js';
import startCase from 'lodash/startCase';

import { tooltipMapping } from './tooltip-mapping';

import type { ReactNode } from 'react';
interface RowProps {
  field: string;
  value: ReactNode;
  decimalPlaces?: number;
  asPercentage?: boolean;
  unformatted?: boolean;
  assetSymbol?: string;
  noBorder?: boolean;
  parentValue?: ReactNode;
  hasParentData?: boolean;
}

export const Row = ({
  field,
  value,
  decimalPlaces,
  asPercentage,
  unformatted,
  assetSymbol = '',
  noBorder = true,
  parentValue,
  hasParentData,
}: RowProps) => {
  // Note: we need both 'parentValue' and 'hasParentData' to do a conditional
  // check to differentiate between when parentData itself is missing and when
  // a specific parentValue is missing. These values are only used when we
  // have successor market parent data.

  const className = 'text-sm';

  const getFormattedValue = (value: ReactNode) => {
    if (typeof value !== 'string' && typeof value !== 'number') return value;
    if (unformatted || isNaN(Number(value))) {
      return value;
    }
    if (decimalPlaces) {
      return `${addDecimalsFormatNumber(value, decimalPlaces)} ${assetSymbol}`;
    }
    if (asPercentage) {
      return formatNumberPercentage(new BigNumber(value).times(100));
    }
    if (assetSymbol) {
      return `${Number(value).toLocaleString()} ${assetSymbol}`;
    }
    return Number(value).toLocaleString();
  };

  const formattedValue = getFormattedValue(value);

  if (!formattedValue) return null;

  const newValueInSuccessorMarket = hasParentData && value && !parentValue;
  const valueDiffersFromParentMarket = parentValue && parentValue !== value;

  return (
    <KeyValueTableRow
      key={field}
      inline={true}
      noBorder={noBorder}
      dtClassName={className}
      ddClassName={className}
    >
      <div className="flex items-center gap-3">
        <Tooltip description={tooltipMapping[field]} align="start">
          <div tabIndex={-1}>{startCase(t(field))}</div>
        </Tooltip>

        {valueDiffersFromParentMarket && (
          <Lozenge className="py-0" variant={Intent.Primary}>
            {t('Updated')}
          </Lozenge>
        )}

        {newValueInSuccessorMarket && (
          <Lozenge className="py-0" variant={Intent.Primary}>
            {t('Added')}
          </Lozenge>
        )}
      </div>
      <div style={{ wordBreak: 'break-word' }}>
        {valueDiffersFromParentMarket ? (
          <div className="flex items-center gap-3">
            <span className="line-through">
              {getFormattedValue(parentValue)}
            </span>
            <span>{formattedValue}</span>
          </div>
        ) : (
          formattedValue
        )}
      </div>
    </KeyValueTableRow>
  );
};

export interface MarketInfoTableProps {
  data: Record<string, ReactNode> | null | undefined;
  decimalPlaces?: number;
  asPercentage?: boolean;
  unformatted?: boolean;
  children?: ReactNode;
  assetSymbol?: string;
  noBorder?: boolean;
  parentData?: Record<string, ReactNode> | null | undefined;
}

export const MarketInfoTable = ({
  data,
  decimalPlaces,
  asPercentage,
  unformatted,
  children,
  assetSymbol,
  noBorder,
  parentData,
}: MarketInfoTableProps) => {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const hasParentData = parentData !== undefined;

  return (
    <>
      <KeyValueTable>
        <>
          {Object.entries(data).map(([key, value]) => (
            <Row
              key={key}
              field={key}
              value={value}
              decimalPlaces={decimalPlaces}
              assetSymbol={assetSymbol}
              asPercentage={asPercentage}
              unformatted={unformatted}
              noBorder={noBorder}
              parentValue={parentData?.[key]}
              hasParentData={hasParentData}
            />
          ))}
        </>
      </KeyValueTable>
      <div className="flex flex-col gap-2">{children}</div>
    </>
  );
};

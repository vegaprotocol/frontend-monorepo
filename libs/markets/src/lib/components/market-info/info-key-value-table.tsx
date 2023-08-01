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
  oldValue?: ReactNode;
  isNewValue?: boolean;
}

export const Row = ({
  field,
  value,
  decimalPlaces,
  asPercentage,
  unformatted,
  assetSymbol = '',
  noBorder = true,
  oldValue,
  isNewValue,
}: RowProps) => {
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
  const oldFormattedValue = oldValue && getFormattedValue(oldValue);

  const hasChangedFormattedValue =
    oldFormattedValue && oldFormattedValue !== formattedValue;

  if (!formattedValue) return null;

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

        {isNewValue && (
          <Lozenge className="py-0" variant={Intent.Success}>
            {t('Added')}
          </Lozenge>
        )}

        {hasChangedFormattedValue && (
          <Lozenge className="py-0" variant={Intent.Danger}>
            {t('Updated')}
          </Lozenge>
        )}
      </div>
      <div style={{ wordBreak: 'break-word' }}>
        {hasChangedFormattedValue ? (
          <div className="flex items-center gap-3">
            <span className="line-through">{oldFormattedValue}</span>
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
  parentMarketData?: Record<string, ReactNode> | null | undefined;
}

export const MarketInfoTable = ({
  data,
  decimalPlaces,
  asPercentage,
  unformatted,
  children,
  assetSymbol,
  noBorder,
}: MarketInfoTableProps) => {
  if (!data || typeof data !== 'object') {
    return null;
  }
  return (
    <>
      <KeyValueTable>
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
          />
        ))}
      </KeyValueTable>
      <div className="flex flex-col gap-2">{children}</div>
    </>
  );
};

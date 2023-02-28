import React from 'react';
import type { ReactNode } from 'react';
import { t } from '@vegaprotocol/i18n';
import { Icon, Tooltip, TrafficLight } from '@vegaprotocol/ui-toolkit';
import { IconNames } from '@blueprintjs/icons';
import * as constants from '../constants';

interface DealTicketEstimatesProps {
  quoteName?: string;
  price?: string;
  estCloseOut?: string;
  estMargin?: string;
  fees?: string;
  notionalSize?: string;
  size?: string;
  slippage?: string;
}

export const DealTicketEstimates = ({
  price,
  quoteName,
  estCloseOut,
  estMargin,
  fees,
  notionalSize,
  size,
  slippage,
}: DealTicketEstimatesProps) => (
  <dl className="text-black dark:text-white">
    {size && (
      <div className="flex justify-between mb-2">
        <DataTitle>{t('Contracts')}</DataTitle>
        <ValueTooltipRow
          value={size}
          description={constants.CONTRACTS_MARGIN_TOOLTIP_TEXT}
          id="contracts_tooltip_trigger"
        />
      </div>
    )}
    {price && (
      <div className="flex justify-between mb-2">
        <DataTitle>{t('Est. Price')}</DataTitle>
        <dd>{price}</dd>
      </div>
    )}
    {notionalSize && (
      <div className="flex justify-between mb-2">
        <DataTitle quoteName={quoteName}>{t('Est. Position Size')}</DataTitle>
        <ValueTooltipRow
          value={notionalSize}
          description={constants.NOTIONAL_SIZE_TOOLTIP_TEXT(quoteName || '')}
        />
      </div>
    )}
    {fees && (
      <div className="flex justify-between mb-2">
        <DataTitle quoteName={quoteName}>{t('Est. Fees')}</DataTitle>
        <ValueTooltipRow
          value={fees}
          description={constants.EST_FEES_TOOLTIP_TEXT}
        />
      </div>
    )}
    {estMargin && (
      <div className="flex justify-between mb-2">
        <DataTitle quoteName={quoteName}>{t('Est. Margin')}</DataTitle>
        <ValueTooltipRow
          value={estMargin}
          description={constants.EST_MARGIN_TOOLTIP_TEXT(quoteName || '')}
        />
      </div>
    )}
    {estCloseOut && (
      <div className="flex justify-between mb-2">
        <DataTitle quoteName={quoteName}>{t('Est. Close out')}</DataTitle>
        <ValueTooltipRow
          value={estCloseOut}
          description={constants.EST_CLOSEOUT_TOOLTIP_TEXT(quoteName || '')}
        />
      </div>
    )}
    {slippage && (
      <div className="flex justify-between mb-2">
        <DataTitle>{t('Est. Price Impact / Slippage')}</DataTitle>
        <ValueTooltipRow description={constants.EST_SLIPPAGE}>
          <TrafficLight value={parseFloat(slippage)} q1={1} q2={5}>
            {slippage}%
          </TrafficLight>
        </ValueTooltipRow>
      </div>
    )}
  </dl>
);

interface DataTitleProps {
  children: ReactNode;
  quoteName?: string;
}

export const DataTitle = ({ children, quoteName = '' }: DataTitleProps) => (
  <dt>
    {children}
    {quoteName && <small> ({quoteName})</small>}
  </dt>
);

interface ValueTooltipProps {
  value?: string;
  children?: ReactNode;
  description: string;
  id?: string;
}

export const ValueTooltipRow = ({
  value,
  children,
  description,
  id,
}: ValueTooltipProps) => (
  <dd className="flex gap-x-2 items-center">
    {value || children}
    <Tooltip align="center" description={description}>
      <div className="cursor-help" id={id || ''} tabIndex={-1}>
        <Icon
          name={IconNames.ISSUE}
          className="block rotate-180"
          ariaLabel={description}
        />
      </div>
    </Tooltip>
  </dd>
);

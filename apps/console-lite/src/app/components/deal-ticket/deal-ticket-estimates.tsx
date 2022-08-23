import React from 'react';
import type { ReactNode } from 'react';
import { t } from '@vegaprotocol/react-helpers';
import { Icon, Tooltip } from '@vegaprotocol/ui-toolkit';
import { IconNames } from '@blueprintjs/icons';
import * as constants from './constants';

interface DealTicketEstimatesProps {
  quoteName?: string;
  price?: string;
  estCloseOut?: string;
  estMargin?: string;
  fees?: string;
  notionalSize?: string;
  size?: string;
}

interface DataTitleProps {
  children: ReactNode;
  quoteName?: string;
}

const DataTitle = ({ children, quoteName = '' }: DataTitleProps) => (
  <dt>
    {children}
    {quoteName && <small> ({quoteName})</small>}
  </dt>
);

interface ValueTooltipProps {
  value: string;
  description: string;
  id?: string;
}

const ValueTooltipRow = ({ value, description, id }: ValueTooltipProps) => (
  <dd className="flex gap-x-5 items-center">
    {value}
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

export const DealTicketEstimates = ({
  price,
  quoteName,
  estCloseOut,
  estMargin,
  fees,
  notionalSize,
  size,
}: DealTicketEstimatesProps) => (
  <dl className="text-black dark:text-white">
    {size && (
      <div className="flex justify-between mb-8">
        <DataTitle>{t('Contracts')}</DataTitle>
        <ValueTooltipRow
          value={size}
          description={constants.CONTRACTS_MARGIN_TOOLTIP_TEXT}
          id="contracts_tooltip_trigger"
        />
      </div>
    )}
    {price && (
      <div className="flex justify-between mb-8">
        <DataTitle>{t('Est. Price')}</DataTitle>
        <dd>{price}</dd>
      </div>
    )}
    {notionalSize && (
      <div className="flex justify-between mb-8">
        <DataTitle quoteName={quoteName}>{t('Est. Position Size')}</DataTitle>
        <ValueTooltipRow
          value={notionalSize}
          description={constants.NOTIONAL_SIZE_TOOLTIP_TEXT}
        />
      </div>
    )}
    {fees && (
      <div className="flex justify-between mb-8">
        <DataTitle quoteName={quoteName}>{t('Est. Fees')}</DataTitle>
        <ValueTooltipRow
          value={fees}
          description={constants.EST_FEES_TOOLTIP_TEXT}
        />
      </div>
    )}
    {estMargin && (
      <div className="flex justify-between mb-8">
        <DataTitle quoteName={quoteName}>{t('Est. Margin')}</DataTitle>
        <ValueTooltipRow
          value={estMargin}
          description={constants.EST_MARGIN_TOOLTIP_TEXT}
        />
      </div>
    )}
    {estCloseOut && (
      <div className="flex justify-between">
        <dt>
          <span>{t('Est. Close out')}</span>
          &nbsp;
          <small>({quoteName})</small>
        </dt>
        <ValueTooltipRow
          value={estCloseOut}
          description={constants.EST_CLOSEOUT_TOOLTIP_TEXT}
        />
      </div>
    )}
  </dl>
);

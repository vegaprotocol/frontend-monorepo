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
        <dd className="flex gap-x-5 items-center">
          {size}
          <Tooltip
            align="center"
            description={constants.CONTRACTS_MARGIN_TOOLTIP_TEXT}
          >
            <div className="cursor-help" id="contracts_tooltip_trigger">
              <Icon
                name={IconNames.ISSUE}
                className="block rotate-180"
                ariaLabel={constants.CONTRACTS_MARGIN_TOOLTIP_TEXT}
              />
            </div>
          </Tooltip>
        </dd>
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
        <dd className="flex gap-x-5 items-center">
          {notionalSize}
          <Tooltip
            align="center"
            description={constants.NOTIONAL_SIZE_TOOLTIP_TEXT}
          >
            <div className="cursor-help">
              <Icon
                name={IconNames.ISSUE}
                className="block rotate-180"
                ariaLabel={constants.NOTIONAL_SIZE_TOOLTIP_TEXT}
              />
            </div>
          </Tooltip>
        </dd>
      </div>
    )}
    {fees && (
      <div className="flex justify-between mb-8">
        <DataTitle quoteName={quoteName}>{t('Est. Fees')}</DataTitle>
        <dd className="flex gap-x-5 items-center">
          {fees}
          <Tooltip align="center" description={constants.EST_FEES_TOOLTIP_TEXT}>
            <div className="cursor-help">
              <Icon
                name={IconNames.ISSUE}
                className="block rotate-180"
                ariaLabel={constants.EST_FEES_TOOLTIP_TEXT}
              />
            </div>
          </Tooltip>
        </dd>
      </div>
    )}
    {estMargin && (
      <div className="flex justify-between mb-8">
        <DataTitle quoteName={quoteName}>{t('Est. Margin')}</DataTitle>
        <dd className="flex gap-x-5 items-center">
          {estMargin}
          <Tooltip
            align="center"
            description={constants.EST_MARGIN_TOOLTIP_TEXT}
          >
            <div className="cursor-help">
              <Icon
                name={IconNames.ISSUE}
                className="block rotate-180"
                ariaLabel={constants.EST_MARGIN_TOOLTIP_TEXT}
              />
            </div>
          </Tooltip>
        </dd>
      </div>
    )}
    {estCloseOut && (
      <div className="flex justify-between">
        <dt>
          <span>{t('Est. Close out')}</span>
          &nbsp;
          <small>({quoteName})</small>
        </dt>
        <dd className="flex gap-x-5 items-center">
          {estCloseOut}
          <Tooltip
            align="center"
            description={constants.EST_CLOSEOUT_TOOLTIP_TEXT}
          >
            <div className="cursor-help">
              <Icon
                name={IconNames.ISSUE}
                className="block rotate-180"
                ariaLabel={constants.EST_CLOSEOUT_TOOLTIP_TEXT}
              />
            </div>
          </Tooltip>
        </dd>
      </div>
    )}
  </dl>
);

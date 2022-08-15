import React from 'react';
import type { ReactNode } from 'react';
import { t } from '@vegaprotocol/react-helpers';

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
        <DataTitle>{t('No. of Contracts')}</DataTitle>
        <dd>{size}</dd>
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
        <dd>{notionalSize}</dd>
      </div>
    )}
    {fees && (
      <div className="flex justify-between mb-8">
        <DataTitle quoteName={quoteName}>{t('Est. Fees')}</DataTitle>
        <dd>{fees}</dd>
      </div>
    )}
    {estMargin && (
      <div className="flex justify-between mb-8">
        <DataTitle quoteName={quoteName}>{t('Est. Margin')}</DataTitle>
        <dd>{estMargin}</dd>
      </div>
    )}
    {estCloseOut && (
      <div className="flex justify-between">
        <dt>
          <span>{t('Est. Close out')}</span>
          &nbsp;
          <small>({quoteName})</small>
        </dt>
        <dd>{estCloseOut}</dd>
      </div>
    )}
  </dl>
);

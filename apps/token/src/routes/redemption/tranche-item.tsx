import { format } from 'date-fns';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { LockedProgress } from '../../components/locked-progress';
import { DATE_FORMAT_LONG } from '../../lib/date-formats';
import { formatNumber } from '../../lib/format-number';
import type { BigNumber } from '../../lib/bignumber';

export interface TrancheItemProps {
  tranche: {
    tranche_id: number;
    tranche_start: Date;
    tranche_end: Date;
  };
  locked: BigNumber;
  unlocked: BigNumber;
  total: BigNumber;
  message?: React.ReactNode;
  secondaryHeader?: React.ReactNode;
  link?: string;
}

export const TrancheItem = ({
  tranche,
  locked,
  unlocked,
  total,
  message,
  secondaryHeader,
  link,
}: TrancheItemProps) => {
  const { t } = useTranslation();
  const labelClasses =
    'inline-block uppercase bg-white text-black py-4 px-8 font-mono';

  return (
    <section data-testid="tranche-item" className="mb-40">
      <div className="flex border-b">
        {link ? (
          <Link to={link}>
            <span className={labelClasses}>
              {t('Tranche')} {tranche.tranche_id}
            </span>
          </Link>
        ) : (
          <span className={labelClasses}>
            {t('Tranche')} {tranche.tranche_id}
          </span>
        )}
        {secondaryHeader}
        <span className="font-mono text-right flex-1">
          {formatNumber(total, 2)}
        </span>
      </div>
      <table className="w-full">
        <tbody>
          <tr>
            <td>{t('Starts unlocking')}</td>
            <td className="text-white-60 text-right">
              {format(tranche.tranche_start, DATE_FORMAT_LONG)}
            </td>
          </tr>
          <tr>
            <td>{t('Fully unlocked')}</td>
            <td className="text-white-60 text-right">
              {format(tranche.tranche_end, DATE_FORMAT_LONG)}
            </td>
          </tr>
        </tbody>
      </table>
      <LockedProgress
        locked={locked}
        unlocked={unlocked}
        total={total}
        leftLabel={t('Locked')}
        rightLabel={t('Unlocked')}
      />

      <div className="text-right" data-testid="tranche-item-footer">
        {message}
      </div>
    </section>
  );
};

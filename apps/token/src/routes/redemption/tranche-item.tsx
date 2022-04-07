import "./tranche-item.scss";

import { format } from "date-fns";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { LockedProgress } from "../../components/locked-progress";
import { BigNumber } from "../../lib/bignumber";
import { DATE_FORMAT_LONG } from "../../lib/date-formats";
import { formatNumber } from "../../lib/format-number";

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

  return (
    <section data-testid="tranche-item" className="tranche-item">
      <div className="tranche-item__header">
        {link ? (
          <Link to={link}>
            <span className="tranche-item__label">
              {t("Tranche")} {tranche.tranche_id}
            </span>
          </Link>
        ) : (
          <span className="tranche-item__label">
            {t("Tranche")} {tranche.tranche_id}
          </span>
        )}
        {secondaryHeader}
        <span>{formatNumber(total, 2)}</span>
      </div>
      <table>
        <tbody>
          <tr>
            <td>{t("Starts unlocking")}</td>
            <td>{format(tranche.tranche_start, DATE_FORMAT_LONG)}</td>
          </tr>
          <tr>
            <td>{t("Fully unlocked")}</td>
            <td>{format(tranche.tranche_end, DATE_FORMAT_LONG)}</td>
          </tr>
        </tbody>
      </table>
      <LockedProgress
        locked={locked}
        unlocked={unlocked}
        total={total}
        leftLabel={t("Locked")}
        rightLabel={t("Unlocked")}
      />

      <div className="tranche-item__footer" data-testid="tranche-item-footer">
        {message}
      </div>
    </section>
  );
};

import "./tranche-table.scss";

import React from "react";
import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import {
  KeyValueTable,
  KeyValueTableRow,
} from "../../components/key-value-table";
import { BigNumber } from "../../lib/bignumber";
import { formatNumber } from "../../lib/format-number";
import { Routes } from "../router-config";
import { TrancheItem } from "./tranche-item";

export interface TrancheTableProps {
  tranche: {
    tranche_id: number;
    tranche_start: Date;
    tranche_end: Date;
  };
  locked: BigNumber;
  vested: BigNumber;
  lien: BigNumber;
  totalVested: BigNumber;
  totalLocked: BigNumber;
  onClick: () => void;
  disabled?: boolean;
}

export const Tranche0Table = ({
  trancheId,
  total,
}: {
  trancheId: number;
  total: BigNumber;
}) => {
  const { t } = useTranslation();
  return (
    <>
      <KeyValueTable numerical={true}>
        <KeyValueTableRow data-testid="tranche-table-total">
          <th>
            <span className="tranche-table__label">
              {t("Tranche")} {trancheId}
            </span>
          </th>
          <td>{formatNumber(total)}</td>
        </KeyValueTableRow>
        <KeyValueTableRow data-testid="tranche-table-locked">
          <th>{t("Locked")}</th>
          <td>{formatNumber(total)}</td>
        </KeyValueTableRow>
      </KeyValueTable>
      <div className="tranche-table__footer" data-testid="tranche-table-footer">
        {t(
          "All the tokens in this tranche are locked and must be assigned to a tranche before they can be redeemed."
        )}
      </div>
    </>
  );
};

export const TrancheTable = ({
  tranche,
  locked,
  vested,
  lien,
  onClick,
  totalVested,
  totalLocked,
  disabled = false,
}: TrancheTableProps) => {
  const { t } = useTranslation();
  const total = vested.plus(locked);
  const trancheFullyLocked =
    tranche.tranche_start.getTime() > new Date().getTime();
  const totalAllTranches = totalVested.plus(totalLocked);
  const unstaked = totalAllTranches.minus(lien);
  const reduceAmount = vested.minus(BigNumber.max(unstaked, 0));
  const redeemable = reduceAmount.isLessThanOrEqualTo(0);

  let message = null;
  if (trancheFullyLocked || vested.isEqualTo(0)) {
    message = (
      <div>
        {t(
          "All the tokens in this tranche are locked and can not be redeemed yet."
        )}
      </div>
    );
  } else if (!trancheFullyLocked && !redeemable) {
    message = (
      <div>
        <Trans
          i18nKey="You must reduce your associated vesting tokens by at least {{amount}} to redeem from this tranche. <stakeLink>Manage your stake</stakeLink> or just <disassociateLink>dissociate your tokens</disassociateLink>."
          values={{
            amount: reduceAmount,
          }}
          components={{
            stakeLink: <Link to={`/staking`} />,
            disassociateLink: <Link to={`/staking/disassociate`} />,
          }}
        />
      </div>
    );
  } else if (!trancheFullyLocked && redeemable) {
    message = (
      <button onClick={onClick} disabled={disabled}>
        {t("Redeem unlocked VEGA from tranche {{id}}", {
          id: tranche.tranche_id,
        })}
      </button>
    );
  }
  return (
    <TrancheItem
      link={`${Routes.TRANCHES}/${tranche.tranche_id}`}
      tranche={tranche}
      locked={locked}
      unlocked={vested}
      total={total}
      message={message}
    />
  );
};

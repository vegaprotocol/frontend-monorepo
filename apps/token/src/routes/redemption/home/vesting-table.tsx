import "./vesting-table.scss";

import React from "react";
import { useTranslation } from "react-i18next";

import {
  KeyValueTable,
  KeyValueTableRow,
} from "../../../components/key-value-table";
import { BigNumber } from "../../../lib/bignumber";
import { formatNumber } from "../../../lib/format-number";

export interface VestingTableProps {
  vested: BigNumber;
  locked: BigNumber;
  associated: BigNumber;
}

export const VestingTable = ({
  vested,
  locked,
  associated,
}: VestingTableProps) => {
  const { t } = useTranslation();
  const total = React.useMemo(() => {
    return vested.plus(locked);
  }, [locked, vested]);
  const vestedPercentage = React.useMemo(() => {
    return vested.div(total).times(100);
  }, [total, vested]);
  const lockedPercentage = React.useMemo(() => {
    return locked.div(total).times(100);
  }, [total, locked]);
  const stakedPercentage = React.useMemo(() => {
    return associated.div(total).times(100);
  }, [total, associated]);
  return (
    <section data-testid="vesting-table" className="vesting-table">
      <h2>{t("Across all tranches")}</h2>
      <KeyValueTable numerical={true}>
        <KeyValueTableRow
          data-testid="vesting-table-total"
          className="vesting-table__top-solid-border"
        >
          <th>{t("Vesting VEGA")}</th>
          <td>{formatNumber(total)}</td>
        </KeyValueTableRow>
        <KeyValueTableRow data-testid="vesting-table-locked">
          <th>
            <div className="vesting-table__indicator-square vesting-table__indicator-square--locked"></div>
            {t("Locked")}
          </th>
          <td>{formatNumber(locked)}</td>
        </KeyValueTableRow>
        <KeyValueTableRow data-testid="vesting-table-unlocked">
          <th>
            <div className="vesting-table__indicator-square vesting-table__indicator-square--unlocked"></div>
            {t("Unlocked")}
          </th>
          <td>{formatNumber(vested)}</td>
        </KeyValueTableRow>
        <KeyValueTableRow data-testid="vesting-table-staked">
          <th>
            <div className="vesting-table__indicator-square vesting-table__indicator-square--staked"></div>
            {t("Associated")}
          </th>
          <td>{formatNumber(associated)}</td>
        </KeyValueTableRow>
      </KeyValueTable>
      <div className="vesting-table__progress-bar">
        <div
          className="vesting-table__progress-bar--locked"
          style={{ flex: lockedPercentage.toNumber() }}
        ></div>
        <div
          className="vesting-table__progress-bar--vested"
          style={{ flex: vestedPercentage.toNumber() }}
        ></div>
      </div>
      <div className="vesting-table__progress-bar vesting-table__progress-bar--small">
        <div
          className="vesting-table__progress-bar--staked"
          style={{ flex: stakedPercentage.toNumber() }}
        ></div>
        <div
          className="vesting-table__progress-bar"
          style={{
            flex: new BigNumber(100).minus(stakedPercentage).toNumber(),
          }}
        ></div>
      </div>
    </section>
  );
};

import "./validator-table.scss";

import React from "react";
import { useTranslation } from "react-i18next";

import { EtherscanLink } from "../../components/etherscan-link";
import { CopyToClipboardType } from "../../components/etherscan-link/etherscan-link";
import {
  KeyValueTable,
  KeyValueTableRow,
} from "../../components/key-value-table";
import { BigNumber } from "../../lib/bignumber";
import { formatNumber } from "../../lib/format-number";
import { Staking_nodes } from "./__generated__/Staking";

export interface ValidatorTableProps {
  node: Staking_nodes;
  stakedTotal: string;
  stakeThisEpoch: BigNumber;
}

export const ValidatorTable = ({
  node,
  stakedTotal,
  stakeThisEpoch,
}: ValidatorTableProps) => {
  const { t } = useTranslation();
  const stakePercentage = React.useMemo(() => {
    const total = new BigNumber(stakedTotal);
    const stakedOnNode = new BigNumber(node.stakedTotalFormatted);
    const stakedTotalPercentage =
      total.isEqualTo(0) || stakedOnNode.isEqualTo(0)
        ? "-"
        : stakedOnNode.dividedBy(total).times(100).dp(2).toString() + "%";
    return stakedTotalPercentage;
  }, [node.stakedTotalFormatted, stakedTotal]);

  return (
    <>
      <KeyValueTable data-testid="validator-table">
        <KeyValueTableRow>
          <th>{t("id")}:</th>
          <td className="validator-table__cell">{node.id}</td>
        </KeyValueTableRow>
        <KeyValueTableRow>
          <th>{t("VEGA ADDRESS / PUBLIC KEY")}</th>
          <td className="validator-table__cell">{node.pubkey}</td>
        </KeyValueTableRow>
        <KeyValueTableRow>
          <th>{t("ABOUT THIS VALIDATOR")}</th>
          <td>
            <a href={node.infoUrl}>{node.infoUrl}</a>
          </td>
        </KeyValueTableRow>
        <KeyValueTableRow>
          <th>{t("IP ADDRESS")}</th>
          <td>{node.location}</td>
        </KeyValueTableRow>
        <KeyValueTableRow>
          <th>{t("ETHEREUM ADDRESS")}</th>
          <td>
            <EtherscanLink
              text={node.ethereumAdddress}
              address={node.ethereumAdddress}
              copyToClipboard={CopyToClipboardType.LINK}
            />
          </td>
        </KeyValueTableRow>
        <KeyValueTableRow>
          <th>{t("TOTAL STAKE")}</th>
          <td>{node.stakedTotalFormatted}</td>
        </KeyValueTableRow>
        <KeyValueTableRow>
          <th>{t("PENDING STAKE")}</th>
          <td>{node.pendingStakeFormatted}</td>
        </KeyValueTableRow>
        <KeyValueTableRow>
          <th>{t("STAKED BY OPERATOR")}</th>
          <td>{node.stakedByOperatorFormatted}</td>
        </KeyValueTableRow>
        <KeyValueTableRow>
          <th>{t("STAKED BY DELEGATES")}</th>
          <td>{node.stakedByDelegatesFormatted}</td>
        </KeyValueTableRow>
        <KeyValueTableRow>
          <th>{t("STAKE SHARE")}</th>
          <td>{stakePercentage}</td>
        </KeyValueTableRow>
        <KeyValueTableRow>
          <th>{t("OWN STAKE (THIS EPOCH)")}</th>
          <td>{formatNumber(stakeThisEpoch)}</td>
        </KeyValueTableRow>
        <KeyValueTableRow>
          <th>{t("NOMINATED (THIS EPOCH)")}</th>
          <td>{node.stakedByDelegatesFormatted}</td>
        </KeyValueTableRow>
      </KeyValueTable>
    </>
  );
};

import "./dex-table.scss";

import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { EtherscanLink } from "../../../components/etherscan-link";
import { CopyToClipboardType } from "../../../components/etherscan-link/etherscan-link";
import {
  KeyValueTable,
  KeyValueTableRow,
} from "../../../components/key-value-table";
import { Links, REWARDS_POOL_ADDRESSES } from "../../../config";
import { formatNumber } from "../../../lib/format-number";
import { Routes } from "../../router-config";
import { LiquidityState } from "../liquidity-reducer";

interface DexTokensSectionProps {
  name: string;
  contractAddress: string;
  ethAddress: string;
  state: LiquidityState;
}

export const DexTokensSection = ({
  name,
  contractAddress,
  ethAddress,
  state,
}: DexTokensSectionProps) => {
  const { t } = useTranslation();
  const values = React.useMemo(
    () => state.contractData[contractAddress],
    [contractAddress, state.contractData]
  );
  const poolAddress = React.useMemo<string>(
    () => REWARDS_POOL_ADDRESSES[contractAddress],
    [contractAddress]
  );
  if (!values) {
    return <p>{t("Loading")}...</p>;
  }

  return (
    <section className="dex-table">
      <h3>{name}</h3>
      <KeyValueTable className="dex-tokens-section__table">
        <KeyValueTableRow>
          <th>{t("liquidityTokenSushiAddress")}</th>
          <td>
            <a
              target="_blank"
              rel="nofollow noreferrer"
              href={`${Links.SUSHI_PAIRS}/${poolAddress}`}
            >
              {poolAddress}
            </a>
          </td>
        </KeyValueTableRow>
        <KeyValueTableRow>
          <th>{t("liquidityTokenContractAddress")}</th>
          <td>
            <EtherscanLink
              address={contractAddress}
              text={contractAddress}
              copyToClipboard={CopyToClipboardType.LINK}
            />
          </td>
        </KeyValueTableRow>
        <KeyValueTableRow>
          <th>{t("rewardPerEpoch")}</th>
          <td>
            {formatNumber(values.rewardPerEpoch)} {t("VEGA")}
          </td>
        </KeyValueTableRow>
        <KeyValueTableRow>
          <th>{t("rewardTokenContractAddress")}</th>
          <td>
            <EtherscanLink
              address={values.awardContractAddress}
              text={values.awardContractAddress}
              copyToClipboard={CopyToClipboardType.LINK}
            />
          </td>
        </KeyValueTableRow>
        <KeyValueTableRow>
          <th>{t("slpTokenContractAddress")}</th>
          <td>
            <EtherscanLink
              address={values.lpTokenContractAddress}
              text={values.lpTokenContractAddress}
              copyToClipboard={CopyToClipboardType.LINK}
            />
          </td>
        </KeyValueTableRow>
        <KeyValueTableRow>
          <th>{t("lpTokensInRewardPool")}</th>
          <td>
            {formatNumber(values.rewardPoolBalance)} {t("SLP")}
          </td>
        </KeyValueTableRow>
        {ethAddress ? (
          <ConnectedRows lpContractAddress={contractAddress} state={state} />
        ) : null}
      </KeyValueTable>
    </section>
  );
};

interface ConnectedRowsProps {
  lpContractAddress: string;
  state: LiquidityState;
}

const ConnectedRows = ({ lpContractAddress, state }: ConnectedRowsProps) => {
  const { t } = useTranslation();
  const values = React.useMemo(
    () => state.contractData[lpContractAddress],
    [lpContractAddress, state.contractData]
  );
  if (!values.connectedWalletData) {
    return null;
  }
  const {
    availableLPTokens,
    totalStaked,
    pendingStakedLPTokens,
    stakedLPTokens,
    shareOfPool,
    accumulatedRewards,
  } = values.connectedWalletData;
  // Only shows the Deposit/Withdraw button IF they have tokens AND they haven't staked AND we're not on the relevant page
  const hasDeposited = totalStaked.isGreaterThan(0);
  return (
    <>
      <KeyValueTableRow>
        <th>{t("usersLpTokens")}</th>
        <td>
          <div>
            {formatNumber(availableLPTokens)}&nbsp;{t("SLP")}
          </div>
        </td>
      </KeyValueTableRow>
      <KeyValueTableRow>
        <th>
          {pendingStakedLPTokens.isGreaterThan(0)
            ? t("usersPendingStakeLPTokens")
            : t("usersStakedLPTokens")}
        </th>
        <td>
          {pendingStakedLPTokens?.isGreaterThan(0)
            ? formatNumber(pendingStakedLPTokens)
            : formatNumber(stakedLPTokens)}
          &nbsp;{t("SLP")}
        </td>
      </KeyValueTableRow>
      <KeyValueTableRow>
        <th>{t("usersShareOfPool")}</th>
        <td>{formatNumber(shareOfPool)}%</td>
      </KeyValueTableRow>
      <KeyValueTableRow>
        <th>{t("usersAccumulatedRewards")}</th>
        <td>
          <div>
            {formatNumber(accumulatedRewards)} {t("VEGA")}
          </div>
          {hasDeposited && (
            <div style={{ marginTop: 3 }}>
              <Link to={`${Routes.LIQUIDITY}/${lpContractAddress}/withdraw`}>
                <button className="button-secondary">
                  {t("withdrawFromRewardPoolButton")}
                </button>
              </Link>
            </div>
          )}
        </td>
      </KeyValueTableRow>
    </>
  );
};

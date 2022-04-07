import "./staking-node.scss";

import React from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { EpochCountdown } from "../../components/epoch-countdown";
import { Colors } from "../../config";
import { VegaKeyExtended } from "../../contexts/app-state/app-state-context";
import { BigNumber } from "../../lib/bignumber";
import { Staking as StakingQueryResult } from "./__generated__/Staking";
import { ConnectToVega } from "./connect-to-vega";
// import { PendingStake } from "./pending-stake";
import { StakingForm } from "./staking-form";
import { StakingNodesContainer } from "./staking-nodes-container";
import { StakingWalletsContainer } from "./staking-wallets-container";
import { ValidatorTable } from "./validator-table";
import { YourStake } from "./your-stake";

export const StakingNodeContainer = () => {
  return (
    <StakingWalletsContainer>
      {({ currVegaKey }) =>
        currVegaKey ? (
          <StakingNodesContainer>
            {({ data }) => <StakingNode vegaKey={currVegaKey} data={data} />}
          </StakingNodesContainer>
        ) : (
          <ConnectToVega />
        )
      }
    </StakingWalletsContainer>
  );
};

interface StakingNodeProps {
  vegaKey: VegaKeyExtended;
  data?: StakingQueryResult;
}

export const StakingNode = ({ vegaKey, data }: StakingNodeProps) => {
  const { node } = useParams<{ node: string }>();
  const { t } = useTranslation();

  const nodeInfo = React.useMemo(() => {
    return data?.nodes?.find(({ id }) => id === node);
  }, [node, data]);

  const currentEpoch = React.useMemo(() => {
    return data?.epoch.id!;
  }, [data?.epoch.id]);

  const stakeThisEpoch = React.useMemo(() => {
    const delegations = data?.party?.delegations || [];
    const amountsThisEpoch = delegations
      .filter((d) => d.node.id === node)
      .filter((d) => d.epoch === Number(currentEpoch))
      .map((d) => new BigNumber(d.amountFormatted));
    return BigNumber.sum.apply(null, [new BigNumber(0), ...amountsThisEpoch]);
  }, [data?.party?.delegations, node, currentEpoch]);

  const stakeNextEpoch = React.useMemo(() => {
    const delegations = data?.party?.delegations || [];
    const amountsNextEpoch = delegations
      .filter((d) => d.node.id === node)
      .filter((d) => d.epoch === Number(currentEpoch) + 1)
      .map((d) => new BigNumber(d.amountFormatted));

    if (!amountsNextEpoch.length) {
      return stakeThisEpoch;
    }
    return BigNumber.sum.apply(null, [new BigNumber(0), ...amountsNextEpoch]);
  }, [currentEpoch, data?.party?.delegations, node, stakeThisEpoch]);

  // const pendingStakeNextEpoch = React.useMemo(() => {
  //   return stakeNextEpoch.minus(stakeThisEpoch);
  // }, [stakeThisEpoch, stakeNextEpoch]);

  const currentDelegationAmount = React.useMemo(() => {
    if (!data?.party?.delegations) return new BigNumber(0);
    const amounts = data.party.delegations
      .filter((d) => d.epoch === Number(currentEpoch) + 1)
      .map((d) => new BigNumber(d.amountFormatted));
    return BigNumber.sum.apply(null, [new BigNumber(0), ...amounts]);
  }, [currentEpoch, data?.party?.delegations]);

  const unstaked = React.useMemo(() => {
    return new BigNumber(
      data?.party?.stake.currentStakeAvailableFormatted || 0
    ).minus(currentDelegationAmount);
  }, [
    currentDelegationAmount,
    data?.party?.stake.currentStakeAvailableFormatted,
  ]);

  if (!nodeInfo) {
    return (
      <span style={{ color: Colors.RED }}>
        {t("stakingNodeNotFound", { node })}
      </span>
    );
  }

  return (
    <>
      <h2
        data-test-id="validator-node-title"
        style={{ wordBreak: "break-word", marginTop: 0 }}
      >
        {nodeInfo.name
          ? t("validatorTitle", { nodeName: nodeInfo.name })
          : t("validatorTitle", { nodeName: t("validatorTitleFallback") })}
      </h2>
      <ValidatorTable
        node={nodeInfo}
        stakedTotal={data?.nodeData?.stakedTotalFormatted || "0"}
        stakeThisEpoch={stakeThisEpoch}
      />
      {data?.epoch.timestamps.start && data?.epoch.timestamps.expiry && (
        <EpochCountdown
          containerClass="staking-node__epoch"
          id={data.epoch.id}
          startDate={new Date(data?.epoch.timestamps.start)}
          endDate={new Date(data?.epoch.timestamps.expiry)}
        />
      )}
      <YourStake
        stakeNextEpoch={stakeNextEpoch}
        stakeThisEpoch={stakeThisEpoch}
      />
      {/* {pendingStakeNextEpoch.isZero() ? null : (
        <PendingStake
          nodeId={node}
          pubkey={vegaKey.pub}
          pendingAmount={pendingStakeNextEpoch}
        />
      )} */}
      <StakingForm
        pubkey={vegaKey.pub}
        nodeId={node}
        nodeName={nodeInfo.name}
        availableStakeToAdd={unstaked}
        availableStakeToRemove={stakeNextEpoch}
      />
    </>
  );
};

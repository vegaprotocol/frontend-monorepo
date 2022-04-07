import * as Sentry from "@sentry/react";
import { EpochDetails, VegaLPStaking } from "@vegaprotocol/smart-contracts-sdk";
import React from "react";

import { REWARDS_ADDRESSES } from "../../config";
import { useVegaLPStaking } from "../../hooks/use-vega-lp-staking";
import { BigNumber } from "../../lib/bignumber";
import { LiquidityAction, LiquidityActionType } from "./liquidity-reducer";

export const useGetLiquidityBalances = (
  dispatch: React.Dispatch<LiquidityAction>,
  ethAddress: string
) => {
  const lpStakingEth = useVegaLPStaking({
    address: REWARDS_ADDRESSES["SushiSwap VEGA/ETH"],
  });
  const lpStakingUSDC = useVegaLPStaking({
    address: REWARDS_ADDRESSES["SushiSwap VEGA/USDC"],
  });
  const getBalances = React.useCallback(
    async (lpStaking: VegaLPStaking, contractAddress: string) => {
      try {
        const [
          rewardPerEpoch,
          rewardPoolBalance,
          awardContractAddress,
          lpTokenContractAddress,
          epochDetails,
          stakingStart,
        ] = await Promise.all<
          BigNumber,
          BigNumber,
          string,
          string,
          EpochDetails,
          string
        >([
          lpStaking.rewardPerEpoch(),
          lpStaking.totalStaked(),
          lpStaking.awardContractAddress(),
          lpStaking.slpContractAddress(),
          lpStaking.currentEpochDetails(),
          lpStaking.stakingStart(),
        ]);

        let connectedWalletData = null;
        if (ethAddress) {
          const [unstaked, staked, rewards] = await Promise.all([
            lpStaking.totalUnstaked(ethAddress),
            lpStaking.stakedBalance(ethAddress),
            lpStaking.rewardsBalance(ethAddress),
          ]);
          const availableLPTokens = unstaked;
          const stakedLPTokens = staked;
          const accumulatedRewards = rewards;
          const shareOfPool = rewardPoolBalance.isEqualTo(0)
            ? rewardPoolBalance
            : stakedLPTokens.earningRewards
                .dividedBy(rewardPoolBalance)
                .times(100);

          connectedWalletData = {
            availableLPTokens,
            totalStaked: stakedLPTokens?.total,
            stakedLPTokens: stakedLPTokens?.earningRewards,
            pendingStakedLPTokens: stakedLPTokens?.pending,
            shareOfPool,
            accumulatedRewards,
          };
        }

        dispatch({
          type: LiquidityActionType.SET_CONTRACT_INFORMATION,
          contractAddress,
          contractData: {
            epochDetails,
            rewardPerEpoch,
            stakingStart,
            rewardPoolBalance,
            awardContractAddress,
            lpTokenContractAddress,
            connectedWalletData,
          },
        });
      } catch (err) {
        Sentry.captureException(err);
      }
    },
    [dispatch, ethAddress]
  );
  return {
    getBalances,
    lpStakingEth,
    lpStakingUSDC,
  };
};

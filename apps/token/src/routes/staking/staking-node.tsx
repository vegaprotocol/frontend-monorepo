import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { EpochCountdown } from '../../components/epoch-countdown';
import type { VegaKeyExtended } from '@vegaprotocol/wallet';
import { BigNumber } from '../../lib/bignumber';
import type { Staking as StakingQueryResult } from './__generated__/Staking';
import { ConnectToVega } from './connect-to-vega';
import { StakingForm } from './staking-form';
import { StakingNodesContainer } from './staking-nodes-container';
import { StakingWalletsContainer } from './staking-wallets-container';
import { ValidatorTable } from './validator-table';
import { YourStake } from './your-stake';

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
    return data?.epoch.id;
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

  const currentDelegationAmount = React.useMemo(() => {
    if (!data?.party?.delegations) return new BigNumber(0);
    const amounts = data.party.delegations
      .filter((d) => d.epoch === Number(currentEpoch) + 1)
      .map((d) => new BigNumber(d.amountFormatted));
    return BigNumber.sum.apply(null, [new BigNumber(0), ...amounts]);
  }, [currentEpoch, data?.party?.delegations]);

  const unstaked = React.useMemo(() => {
    const value = new BigNumber(
      data?.party?.stake.currentStakeAvailableFormatted || 0
    ).minus(currentDelegationAmount);
    return value.isLessThan(0) ? new BigNumber(0) : value;
  }, [
    currentDelegationAmount,
    data?.party?.stake.currentStakeAvailableFormatted,
  ]);

  if (!nodeInfo) {
    return (
      <span className={'text-vega-red'}>
        {t('stakingNodeNotFound', { node })}
      </span>
    );
  }

  return (
    <>
      <h2 data-test-id="validator-node-title" className="text-h4 break-word">
        {nodeInfo.name
          ? t('validatorTitle', { nodeName: nodeInfo.name })
          : t('validatorTitle', { nodeName: t('validatorTitleFallback') })}
      </h2>
      <section className="mb-24">
        <ValidatorTable
          node={nodeInfo}
          stakedTotal={data?.nodeData?.stakedTotalFormatted || '0'}
          stakeThisEpoch={stakeThisEpoch}
        />
      </section>
      {data?.epoch.timestamps.start && data?.epoch.timestamps.expiry && (
        <section className="mb-24">
          <EpochCountdown
            id={data.epoch.id}
            startDate={new Date(data?.epoch.timestamps.start)}
            endDate={new Date(data?.epoch.timestamps.expiry)}
          />
        </section>
      )}
      <section className="mb-24">
        <YourStake
          stakeNextEpoch={stakeNextEpoch}
          stakeThisEpoch={stakeThisEpoch}
        />
      </section>
      <section>
        <StakingForm
          pubkey={vegaKey.pub}
          nodeId={nodeInfo.id}
          nodeName={nodeInfo.name}
          availableStakeToAdd={unstaked}
          availableStakeToRemove={stakeNextEpoch}
        />
      </section>
    </>
  );
};

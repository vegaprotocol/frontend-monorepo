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
import { usePartyDelegations } from '../../components/vega-wallet/use-party-delegations';
import { useAppState } from '../../contexts/app-state/app-state-context';
import { toBigNum } from '@vegaprotocol/react-helpers';

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
  const {
    appState: { decimals },
  } = useAppState();
  const { t } = useTranslation();

  const nodeInfo = React.useMemo(() => {
    return data?.nodes?.find(({ id }) => id === node);
  }, [node, data]);

  const currentEpoch = React.useMemo(() => {
    return data?.epoch.id;
  }, [data?.epoch.id]);
  const partyDelegations = usePartyDelegations(vegaKey.pub);
  const stakeThisEpoch = React.useMemo(() => {
    const delegations = partyDelegations || [];
    const amountsThisEpoch = delegations
      .filter((d) => d.nodeId === node)
      .filter((d) => d.epochSeq === currentEpoch)
      .map((d) => toBigNum(d.amount, decimals));
    return BigNumber.sum.apply(null, [new BigNumber(0), ...amountsThisEpoch]);
  }, [partyDelegations, node, currentEpoch, decimals]);

  const stakeNextEpoch = React.useMemo(() => {
    const delegations = partyDelegations || [];
    const amountsNextEpoch = delegations
      .filter((d) => d.nodeId === node)
      .filter((d) => Number(d.epochSeq) === Number(currentEpoch) + 1)
      .map((d) => toBigNum(d.amount, decimals));

    if (!amountsNextEpoch.length) {
      return stakeThisEpoch;
    }
    return BigNumber.sum.apply(null, [new BigNumber(0), ...amountsNextEpoch]);
  }, [currentEpoch, decimals, node, partyDelegations, stakeThisEpoch]);

  const currentDelegationAmount = React.useMemo(() => {
    if (!partyDelegations?.length) return new BigNumber(0);
    const amounts = partyDelegations
      .filter((d) => Number(d.epochSeq) === Number(currentEpoch) + 1)
      .map((d) => toBigNum(d.amount, decimals));
    return BigNumber.sum.apply(null, [new BigNumber(0), ...amounts]);
  }, [currentEpoch, decimals, partyDelegations]);

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
      <h2 data-test-id="validator-node-title" className="text-2xl break-word">
        {nodeInfo.name
          ? t('validatorTitle', { nodeName: nodeInfo.name })
          : t('validatorTitle', { nodeName: t('validatorTitleFallback') })}
      </h2>
      <section className="mb-4">
        <ValidatorTable
          node={nodeInfo}
          stakedTotal={data?.nodeData?.stakedTotalFormatted || '0'}
          stakeThisEpoch={stakeThisEpoch}
        />
      </section>
      {data?.epoch.timestamps.start && data?.epoch.timestamps.expiry && (
        <section className="mb-4">
          <EpochCountdown
            id={data.epoch.id}
            startDate={new Date(data?.epoch.timestamps.start)}
            endDate={new Date(data?.epoch.timestamps.expiry)}
          />
        </section>
      )}
      <section className="mb-4">
        <YourStake
          stakeNextEpoch={stakeNextEpoch}
          stakeThisEpoch={stakeThisEpoch}
        />
      </section>
      <section>
        <StakingForm
          currentEpoch={data?.epoch.id}
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

export default StakingNodeContainer;

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { EpochCountdown } from '../../components/epoch-countdown';
import { BigNumber } from '../../lib/bignumber';
import type { Staking as StakingQueryResult } from './__generated__/Staking';
import { ConnectToVega } from './connect-to-vega';
import { StakingForm } from './staking-form';
import { StakingWalletsContainer } from './components/staking-wallets-container';
import { ValidatorTable } from './validator-table';
import { YourStake } from './your-stake';
import StakingNodesContainer from './staking-nodes-container';

export const StakingNodeContainer = () => {
  return (
    <StakingWalletsContainer>
      {({ pubKey }) => (
        <StakingNodesContainer>
          {({ data }) => <StakingNode pubKey={pubKey} data={data} />}
        </StakingNodesContainer>
      )}
    </StakingWalletsContainer>
  );
};

interface StakingNodeProps {
  pubKey: string;
  data?: StakingQueryResult;
}

export const StakingNode = ({ pubKey: vegaKey, data }: StakingNodeProps) => {
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
      <span data-testid="staking-node-not-found" className={'text-vega-red'}>
        {t('stakingNodeNotFound', { node })}
      </span>
    );
  }

  return (
    <div data-testid="staking-node">
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
      {vegaKey ? (
        <>
          <section className="mb-4">
            <YourStake
              stakeNextEpoch={stakeNextEpoch}
              stakeThisEpoch={stakeThisEpoch}
            />
          </section>

          <section>
            <StakingForm
              pubKey={vegaKey}
              nodeId={nodeInfo.id}
              nodeName={nodeInfo.name}
              availableStakeToAdd={unstaked}
              availableStakeToRemove={stakeNextEpoch}
            />
          </section>
        </>
      ) : (
        <>
          <h2>{t('Connect to see your stake')}</h2>
          <ConnectToVega />
        </>
      )}
    </div>
  );
};

export default StakingNodeContainer;

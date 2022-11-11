import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { EpochCountdown } from '../../../components/epoch-countdown';
import { BigNumber } from '../../../lib/bignumber';
import { ConnectToVega } from '../../../components/connect-to-vega/connect-to-vega';
import { StakingForm } from './staking-form';
import { ValidatorTable } from './validator-table';
import { YourStake } from './your-stake';
import NodeContainer from './nodes-container';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useAppState } from '../../../contexts/app-state/app-state-context';
import { toBigNum } from '@vegaprotocol/react-helpers';
import compact from 'lodash/compact';
import type { StakingQuery } from './__generated___/Staking';

interface StakingNodeProps {
  data?: StakingQuery;
}

export const StakingNode = ({ data }: StakingNodeProps) => {
  const { pubKey: vegaKey } = useVegaWallet();
  const {
    appState: { decimals },
  } = useAppState();
  const { node } = useParams<{ node: string }>();
  const { t } = useTranslation();
  const nodeInfo = React.useMemo(() => {
    const canonisedNodes =
      compact(data?.nodesConnection?.edges?.map((edge) => edge?.node)) || [];
    return canonisedNodes.find(({ id }) => id === node);
  }, [node, data]);

  const currentEpoch = React.useMemo(() => {
    return data?.epoch.id;
  }, [data?.epoch.id]);

  const delegations = React.useMemo(
    () =>
      compact(
        data?.party?.delegationsConnection?.edges?.map((edge) => edge?.node)
      ) || [],
    [data?.party?.delegationsConnection?.edges]
  );

  const stakeThisEpoch = React.useMemo(() => {
    const amountsThisEpoch = delegations
      .filter((d) => d.node.id === node)
      .filter((d) => d.epoch === Number(currentEpoch))
      .map((d) => new BigNumber(d.amountFormatted));
    return BigNumber.sum.apply(null, [new BigNumber(0), ...amountsThisEpoch]);
  }, [delegations, node, currentEpoch]);

  const stakeNextEpoch = React.useMemo(() => {
    const amountsNextEpoch = delegations
      .filter((d) => d.node.id === node)
      .filter((d) => d.epoch === Number(currentEpoch) + 1)
      .map((d) => new BigNumber(d.amountFormatted));

    if (!amountsNextEpoch.length) {
      return stakeThisEpoch;
    }
    return BigNumber.sum.apply(null, [new BigNumber(0), ...amountsNextEpoch]);
  }, [currentEpoch, delegations, node, stakeThisEpoch]);

  const currentDelegationAmount = React.useMemo(() => {
    if (delegations.length < 1) return new BigNumber(0);
    const amounts = delegations
      .filter((d) => d.epoch === Number(currentEpoch) + 1)
      .map((d) => new BigNumber(d.amountFormatted));
    return BigNumber.sum.apply(null, [new BigNumber(0), ...amounts]);
  }, [currentEpoch, delegations]);

  const unstaked = React.useMemo(() => {
    const value = toBigNum(
      data?.party?.stakingSummary.currentStakeAvailable || 0,
      decimals
    ).minus(currentDelegationAmount);
    return value.isLessThan(0) ? new BigNumber(0) : value;
  }, [
    currentDelegationAmount,
    data?.party?.stakingSummary.currentStakeAvailable,
    decimals,
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

export const Node = () => {
  return (
    <NodeContainer>{({ data }) => <StakingNode data={data} />}</NodeContainer>
  );
};

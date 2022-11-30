import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { useVegaWallet } from '@vegaprotocol/wallet';
import {
  addDecimal,
  removePaginationWrapper,
  toBigNum,
} from '@vegaprotocol/react-helpers';
import { EpochCountdown } from '../../../components/epoch-countdown';
import { BigNumber } from '../../../lib/bignumber';
import { ConnectToVega } from '../../../components/connect-to-vega';
import { StakingForm } from './staking-form';
import { ValidatorTable } from './validator-table';
import { YourStake } from './your-stake';
import NodeContainer from './nodes-container';
import { useAppState } from '../../../contexts/app-state/app-state-context';
import type { StakingQuery } from './__generated___/Staking';
import type { PreviousEpochQuery } from '../__generated___/PreviousEpoch';

interface StakingNodeProps {
  data?: StakingQuery;
  previousEpochData?: PreviousEpochQuery;
}

export const StakingNode = ({ data, previousEpochData }: StakingNodeProps) => {
  const { pubKey: vegaKey } = useVegaWallet();
  const {
    appState: { decimals },
  } = useAppState();
  const { node } = useParams<{ node: string }>();
  const { t } = useTranslation();

  const { nodeInfo, currentEpoch, delegations } = React.useMemo(
    () => ({
      nodeInfo: removePaginationWrapper(data?.nodesConnection?.edges).find(
        ({ id }) => id === node
      ),
      currentEpoch: data?.epoch.id,
      delegations: removePaginationWrapper(
        data?.party?.delegationsConnection?.edges
      ),
    }),
    [
      data?.epoch.id,
      data?.nodesConnection?.edges,
      data?.party?.delegationsConnection?.edges,
      node,
    ]
  );

  const stakeThisEpoch = React.useMemo(() => {
    const amountsThisEpoch = delegations
      .filter((d) => d.node.id === node)
      .filter((d) => d.epoch === Number(currentEpoch))
      .map((d) => toBigNum(d.amount, decimals));
    return BigNumber.sum.apply(null, [new BigNumber(0), ...amountsThisEpoch]);
  }, [delegations, node, currentEpoch, decimals]);

  const stakeNextEpoch = React.useMemo(() => {
    const amountsNextEpoch = delegations
      .filter((d) => d.node.id === node)
      .filter((d) => d.epoch === Number(currentEpoch) + 1)
      .map((d) => toBigNum(d.amount, decimals));

    if (!amountsNextEpoch.length) {
      return stakeThisEpoch;
    }
    return BigNumber.sum.apply(null, [new BigNumber(0), ...amountsNextEpoch]);
  }, [currentEpoch, decimals, delegations, node, stakeThisEpoch]);

  const currentDelegationAmount = React.useMemo(() => {
    if (delegations.length < 1) return new BigNumber(0);
    const amounts = delegations
      .filter((d) => d.epoch === Number(currentEpoch) + 1)
      .map((d) => toBigNum(d.amount, decimals));
    return BigNumber.sum.apply(null, [new BigNumber(0), ...amounts]);
  }, [currentEpoch, decimals, delegations]);

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
          stakedTotal={addDecimal(data?.nodeData?.stakedTotal || '0', decimals)}
          previousEpochData={previousEpochData}
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
    <NodeContainer>
      {({ data, previousEpochData }) => (
        <StakingNode data={data} previousEpochData={previousEpochData} />
      )}
    </NodeContainer>
  );
};

import { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import BigNumber from 'bignumber.js';
import * as Schema from '@vegaprotocol/types';
import { removePaginationWrapper, toBigNum } from '@vegaprotocol/utils';
import { DocsLinks } from '@vegaprotocol/environment';
import { Link as UTLink, Toggle } from '@vegaprotocol/ui-toolkit';

import { formatNumber } from '../../../../lib/format-number';
import { SubHeading } from '../../../../components/heading';
import { useAppState } from '../../../../contexts/app-state/app-state-context';
import { addUserDataToValidator } from './shared';
import { ConsensusValidatorsTable } from './consensus-validators-table';
import { StandbyPendingValidatorsTable } from './standby-pending-validators-table';
import type { NodesQuery, NodesFragmentFragment } from '../__generated__/Nodes';
import type { PreviousEpochQuery } from '../../__generated__/PreviousEpoch';
import type { StakingQuery } from '../../__generated__/Staking';
import type { StakingDelegationFieldsFragment } from '../../__generated__/Staking';
import type { ValidatorWithUserData } from './shared';

export interface ValidatorsTableProps {
  nodesData: NodesQuery | undefined;
  userStakingData: StakingQuery | undefined;
  previousEpochData: PreviousEpochQuery | undefined;
}

interface SortedValidatorsProps {
  consensusValidators: NodesFragmentFragment[];
  standbyValidators: NodesFragmentFragment[];
  pendingValidators: NodesFragmentFragment[];
}

export type ValidatorsView = 'all' | 'myStake';

export const ValidatorTables = ({
  nodesData,
  userStakingData,
  previousEpochData,
}: ValidatorsTableProps) => {
  const { t } = useTranslation();
  const {
    appState: { decimals },
  } = useAppState();

  const [validatorsView, setValidatorsView] = useState<ValidatorsView>('all');
  const totalStake = useMemo(
    () => nodesData?.nodeData?.stakedTotal || '0',
    [nodesData?.nodeData?.stakedTotal]
  );
  const epochId = useMemo(() => nodesData?.epoch.id, [nodesData?.epoch.id]);
  const currentUserStakeAvailable = useMemo(
    () => userStakingData?.party?.stakingSummary.currentStakeAvailable || '0',
    [userStakingData?.party?.stakingSummary.currentStakeAvailable]
  );

  let stakeNeededForPromotion = undefined;
  let delegations: StakingDelegationFieldsFragment[] | undefined = undefined;

  if (userStakingData) {
    delegations = removePaginationWrapper(
      userStakingData?.party?.delegationsConnection?.edges
    );
  }

  const { consensusValidators, standbyValidators, pendingValidators } = useMemo(
    () =>
      removePaginationWrapper(nodesData?.nodesConnection.edges).reduce(
        (acc: SortedValidatorsProps, validator) => {
          const validatorId = validator.id;
          const currentDelegation = delegations?.find(
            (d) => d.node.id === validatorId && d.epoch === Number(epochId)
          );
          const nextDelegation = delegations?.find(
            (d) => d.node.id === validatorId && d.epoch === Number(epochId) + 1
          );
          if (validator.stakedByOperator !== '0') {
            switch (validator.rankingScore?.status) {
              case Schema.ValidatorStatus.VALIDATOR_NODE_STATUS_TENDERMINT:
                acc.consensusValidators.push(
                  addUserDataToValidator(
                    validator,
                    currentDelegation,
                    nextDelegation,
                    currentUserStakeAvailable
                  )
                );
                break;
              case Schema.ValidatorStatus.VALIDATOR_NODE_STATUS_ERSATZ:
                acc.standbyValidators.push(
                  addUserDataToValidator(
                    validator,
                    currentDelegation,
                    nextDelegation,
                    currentUserStakeAvailable
                  )
                );
                break;
              case Schema.ValidatorStatus.VALIDATOR_NODE_STATUS_PENDING:
                acc.pendingValidators.push(
                  addUserDataToValidator(
                    validator,
                    currentDelegation,
                    nextDelegation,
                    currentUserStakeAvailable
                  )
                );
            }
          }
          return acc;
        },
        {
          consensusValidators: [],
          standbyValidators: [],
          pendingValidators: [],
        }
      ),
    [
      currentUserStakeAvailable,
      delegations,
      epochId,
      nodesData?.nodesConnection.edges,
    ]
  );

  if (
    consensusValidators.length &&
    (standbyValidators.length || pendingValidators.length)
  ) {
    const lowestRankingConsensusScore = consensusValidators.reduce(
      (lowest: ValidatorWithUserData, validator: ValidatorWithUserData) => {
        if (
          Number(validator.rankingScore.rankingScore) <
          Number(lowest.rankingScore.rankingScore)
        ) {
          lowest = validator;
        }
        return lowest;
      }
    ).rankingScore.rankingScore;

    const lowestRankingBigNum = toBigNum(lowestRankingConsensusScore, 0);
    const consensusStakedTotal = consensusValidators.reduce((acc, cur) => {
      return acc.plus(toBigNum(cur.stakedTotal, decimals));
    }, new BigNumber(0));

    stakeNeededForPromotion = formatNumber(
      lowestRankingBigNum.times(consensusStakedTotal),
      2
    ).toString();
  }
  return (
    <section data-testid="validator-tables">
      <div className="grid w-full justify-end">
        <div className="w-[340px]">
          <Toggle
            name="validators-view-toggle"
            toggles={[
              {
                label: t('All validators'),
                value: 'all',
              },
              {
                label: t('Staked by me'),
                value: 'myStake',
              },
            ]}
            checkedValue={validatorsView}
            onChange={(e) =>
              setValidatorsView(e.target.value as ValidatorsView)
            }
          />
        </div>
      </div>

      {consensusValidators.length > 0 && (
        <div className="mb-10">
          <SubHeading title={t('status-tendermint')} />
          <ConsensusValidatorsTable
            data={consensusValidators}
            previousEpochData={previousEpochData}
            totalStake={totalStake}
            validatorsView={validatorsView}
          />
        </div>
      )}
      {standbyValidators.length > 0 && (
        <div className="mb-10">
          <SubHeading title={t('status-ersatz')} />
          <p>
            <Trans
              i18nKey="ersatzDescription"
              values={{
                stakeNeededForPromotion,
              }}
            />
          </p>
          <StandbyPendingValidatorsTable
            data={standbyValidators}
            previousEpochData={previousEpochData}
            totalStake={totalStake}
            stakeNeededForPromotion={stakeNeededForPromotion}
            stakeNeededForPromotionDescription="StakeNeededForPromotionStandbyDescription"
            validatorsView={validatorsView}
          />
        </div>
      )}
      {pendingValidators.length > 0 && (
        <>
          <SubHeading title={t('status-pending')} />
          <p>
            {DocsLinks && (
              <>
                <span>{t('pendingDescription1')} </span>
                <span>
                  <UTLink
                    href={DocsLinks.STAKING_GUIDE}
                    target="_blank"
                    data-testid="validator-forum-link"
                  >
                    {t('pendingDescriptionLinkText')}
                  </UTLink>
                </span>
              </>
            )}
            <span>{t('pendingDescription2')}</span>
          </p>
          <StandbyPendingValidatorsTable
            data={pendingValidators}
            previousEpochData={previousEpochData}
            totalStake={totalStake}
            stakeNeededForPromotion={stakeNeededForPromotion}
            stakeNeededForPromotionDescription="StakeNeededForPromotionCandidateDescription"
            validatorsView={validatorsView}
          />
        </>
      )}
    </section>
  );
};

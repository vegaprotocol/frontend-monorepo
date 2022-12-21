import { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { ConsensusValidatorsTable } from './consensus-validators-table';
import { StandbyPendingValidatorsTable } from './standby-pending-validators-table';
import * as Schema from '@vegaprotocol/types';
import { formatNumber } from '../../../../lib/format-number';
import {
  createDocsLinks,
  removePaginationWrapper,
  toBigNum,
} from '@vegaprotocol/react-helpers';
import { Link as UTLink } from '@vegaprotocol/ui-toolkit';
import { SubHeading } from '../../../../components/heading';
import { useEnvironment } from '@vegaprotocol/environment';
import { useAppState } from '../../../../contexts/app-state/app-state-context';
import type {
  NodesQuery,
  NodesFragmentFragment,
} from '../__generated___/Nodes';
import type { PreviousEpochQuery } from '../../__generated___/PreviousEpoch';

export interface ValidatorsTableProps {
  data: NodesQuery | undefined;
  previousEpochData: PreviousEpochQuery | undefined;
}

interface SortedValidatorsProps {
  consensusValidators: NodesFragmentFragment[];
  standbyValidators: NodesFragmentFragment[];
  pendingValidators: NodesFragmentFragment[];
}

export const ValidatorTables = ({
  data,
  previousEpochData,
}: ValidatorsTableProps) => {
  const { t } = useTranslation();
  const { VEGA_DOCS_URL } = useEnvironment();
  const {
    appState: { decimals },
  } = useAppState();
  const totalStake = useMemo(
    () => data?.nodeData?.stakedTotal || '0',
    [data?.nodeData?.stakedTotal]
  );
  let stakeNeededForPromotion = undefined;

  const { consensusValidators, standbyValidators, pendingValidators } = useMemo(
    () =>
      removePaginationWrapper(data?.nodesConnection.edges).reduce(
        (acc: SortedValidatorsProps, validator) => {
          switch (validator.rankingScore?.status) {
            case Schema.ValidatorStatus.VALIDATOR_NODE_STATUS_TENDERMINT:
              acc.consensusValidators.push(validator);
              break;
            case Schema.ValidatorStatus.VALIDATOR_NODE_STATUS_ERSATZ:
              acc.standbyValidators.push(validator);
              break;
            case Schema.ValidatorStatus.VALIDATOR_NODE_STATUS_PENDING:
              acc.pendingValidators.push(validator);
          }
          console.log(data?.nodesConnection.edges);
          return acc;
        },
        {
          consensusValidators: [],
          standbyValidators: [],
          pendingValidators: [],
        }
      ),
    [data?.nodesConnection.edges]
  );

  if (
    consensusValidators.length &&
    (standbyValidators.length || pendingValidators.length)
  ) {
    const lowestRankingConsensusScore = consensusValidators.reduce(
      (lowest: NodesFragmentFragment, validator: NodesFragmentFragment) => {
        if (
          validator?.rankingScore &&
          Number(validator.rankingScore) < Number(lowest.rankingScore)
        ) {
          lowest = validator;
        }
        return lowest;
      }
    ).rankingScore.rankingScore;

    const lowestRankingBigNum = toBigNum(lowestRankingConsensusScore, 0);
    const totalStakeBigNum = toBigNum(totalStake, decimals);

    stakeNeededForPromotion = formatNumber(
      lowestRankingBigNum.times(totalStakeBigNum),
      2
    ).toString();
  }
  return (
    <div data-testid="validator-tables">
      {consensusValidators.length > 0 && (
        <>
          <SubHeading title={t('status-tendermint')} />
          <ConsensusValidatorsTable
            data={consensusValidators}
            previousEpochData={previousEpochData}
            totalStake={totalStake}
          />
        </>
      )}
      {standbyValidators.length > 0 && (
        <>
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
          />
        </>
      )}
      {pendingValidators.length > 0 && (
        <>
          <SubHeading title={t('status-pending')} />
          <p>
            {VEGA_DOCS_URL && (
              <>
                <span>{t('pendingDescription1')} </span>
                <span>
                  <UTLink
                    href={createDocsLinks(VEGA_DOCS_URL).STAKING_GUIDE}
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
          />
        </>
      )}
    </div>
  );
};

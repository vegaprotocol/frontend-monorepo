import compact from 'lodash/compact';
import { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { ConsensusValidatorsTable } from './consensus-validators-table';
import { StandbyPendingValidatorsTable } from './standby-pending-validators-table';
import { Schema } from '@vegaprotocol/types';
import type {
  NodesQuery,
  NodesFragmentFragment,
} from '../__generated___/Nodes';
import type { PreviousEpochQuery } from '../__generated___/PreviousEpoch';
import { formatNumber } from '../../../../lib/format-number';
import {
  createDocsLinks,
  removeNodeFromEdges,
  toBigNum,
} from '@vegaprotocol/react-helpers';
import { Link as UTLink } from '@vegaprotocol/ui-toolkit';
import { useEnvironment } from '@vegaprotocol/environment';

export interface ValidatorsTableProps {
  data: NodesQuery | undefined;
  previousEpochData: PreviousEpochQuery | undefined;
}

export const ValidatorTables = ({
  data,
  previousEpochData,
}: ValidatorsTableProps) => {
  const { t } = useTranslation();
  const { VEGA_DOCS_URL } = useEnvironment();
  const totalStake = useMemo(
    () => data?.nodeData?.stakedTotal || '0',
    [data?.nodeData?.stakedTotal]
  );
  let stakeNeededForPromotion = undefined;

  const consensusValidators = useMemo(() => {
    if (!data?.nodesConnection.edges) return [];

    return removeNodeFromEdges(data.nodesConnection.edges).filter(
      (edge) =>
        edge?.rankingScore?.status ===
        Schema.ValidatorStatus.VALIDATOR_NODE_STATUS_TENDERMINT
    );
  }, [data?.nodesConnection.edges]);

  const standbyValidators = useMemo(() => {
    if (!data?.nodesConnection.edges) return [];

    return compact(data.nodesConnection.edges.map((edge) => edge?.node)).filter(
      (edge) =>
        edge?.rankingScore?.status ===
        Schema.ValidatorStatus.VALIDATOR_NODE_STATUS_ERSATZ
    );
  }, [data?.nodesConnection.edges]);

  const pendingValidators = useMemo(() => {
    if (!data?.nodesConnection.edges) return [];

    return compact(data.nodesConnection.edges.map((edge) => edge?.node)).filter(
      (edge) =>
        edge?.rankingScore?.status ===
        Schema.ValidatorStatus.VALIDATOR_NODE_STATUS_PENDING
    );
  }, [data?.nodesConnection.edges]);

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
    const totalStakeBigNum = toBigNum(totalStake, 18);

    stakeNeededForPromotion = formatNumber(
      lowestRankingBigNum.times(totalStakeBigNum),
      2
    ).toString();
  }

  return (
    <div data-testid="validator-tables">
      {consensusValidators.length > 0 && (
        <>
          <h2>{t('status-tendermint')}</h2>
          <ConsensusValidatorsTable
            data={consensusValidators}
            previousEpochData={previousEpochData}
            totalStake={totalStake}
          />
        </>
      )}
      {standbyValidators.length && (
        <>
          <h2>{t('status-ersatz')}</h2>
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
          />
        </>
      )}
      {pendingValidators.length && (
        <>
          <h2>{t('status-pending')}</h2>
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
          />
        </>
      )}
    </div>
  );
};

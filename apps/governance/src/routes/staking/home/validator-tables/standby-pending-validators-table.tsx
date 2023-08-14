import { forwardRef, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AgGridLazy as AgGrid } from '@vegaprotocol/datagrid';
import { useAppState } from '../../../../contexts/app-state/app-state-context';
import { BigNumber } from '../../../../lib/bignumber';
import {
  calculatesPerformancePenalty,
  calculateOverallPenalty,
  calculateOverstakedPenalty,
  getFormattedPerformanceScore,
  getLastEpochScoreAndPerformance,
} from '../../shared';
import {
  defaultColDef,
  stakedTotalPercentage,
  ValidatorFields,
  ValidatorRenderer,
  TotalPenaltiesRenderer,
  TotalStakeRenderer,
  StakeShareRenderer,
  PendingStakeRenderer,
  VotingPowerRenderer,
} from './shared';
import type { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';
import type { ValidatorsTableProps } from './shared';
import {
  formatNumber,
  formatNumberPercentage,
  removePaginationWrapper,
  toBigNum,
} from '@vegaprotocol/utils';

interface StandbyPendingValidatorsTableProps extends ValidatorsTableProps {
  stakeNeededForPromotion: string | undefined;
  stakeNeededForPromotionDescription: string;
}

export const StandbyPendingValidatorsTable = ({
  data,
  previousEpochData,
  stakeNeededForPromotion,
  stakeNeededForPromotionDescription,
  validatorsView,
}: StandbyPendingValidatorsTableProps) => {
  const { t } = useTranslation();
  const {
    appState: { decimals },
  } = useAppState();
  const navigate = useNavigate();

  const gridRef = useRef<AgGridReact | null>(null);

  const allNodesInPreviousEpoch = removePaginationWrapper(
    previousEpochData?.epoch.validatorsConnection?.edges
  );

  let nodes = useMemo(() => {
    if (!data) return [];

    return data
      .sort((a, b) => {
        const aStakedTotal = new BigNumber(a.stakedTotal);
        const bStakedTotal = new BigNumber(b.stakedTotal);
        return bStakedTotal.minus(aStakedTotal).toNumber();
      })
      .map((node, index) => {
        const stakedTotalRanking = index + 1;

        return {
          ...node,
          stakedTotalRanking,
        };
      })
      .map(
        ({
          id,
          name,
          avatarUrl,
          stakedByDelegates,
          stakedByOperator,
          stakedTotal,
          rankingScore: { stakeScore, performanceScore },
          pendingStake,
          stakedTotalRanking,
          stakedByUser,
          pendingUserStake,
          userStakeShare,
        }) => {
          const { performanceScore: previousEpochPerformanceScore } =
            getLastEpochScoreAndPerformance(previousEpochData, id);

          let individualStakeNeededForPromotion,
            individualStakeNeededForPromotionDescription;

          if (stakeNeededForPromotion && previousEpochPerformanceScore) {
            const stakedTotalBigNum = new BigNumber(stakedTotal);
            const stakeNeededBigNum = new BigNumber(stakeNeededForPromotion);
            const performanceScoreBigNum = new BigNumber(
              previousEpochPerformanceScore
            );

            const calc = stakeNeededBigNum
              .dividedBy(performanceScoreBigNum)
              .minus(stakedTotalBigNum);

            if (calc.isGreaterThan(0)) {
              individualStakeNeededForPromotion = calc.toString();
              individualStakeNeededForPromotionDescription = t(
                stakeNeededForPromotionDescription,
                {
                  prefix: formatNumber(calc, 2).toString(),
                }
              );
            } else {
              individualStakeNeededForPromotion = '0';
              individualStakeNeededForPromotionDescription = t(
                stakeNeededForPromotionDescription,
                {
                  prefix: formatNumber(0, 2).toString(),
                }
              );
            }
          }

          return {
            id,
            [ValidatorFields.RANKING_INDEX]: stakedTotalRanking,
            [ValidatorFields.VALIDATOR]: {
              avatarUrl,
              name,
            },
            [ValidatorFields.STAKE]: stakedTotal,
            [ValidatorFields.NORMALISED_VOTING_POWER]: '0%',
            [ValidatorFields.UNNORMALISED_VOTING_POWER]: '0%',
            [ValidatorFields.STAKE_NEEDED_FOR_PROMOTION]:
              individualStakeNeededForPromotion || null,
            [ValidatorFields.STAKE_NEEDED_FOR_PROMOTION_DESCRIPTION]:
              individualStakeNeededForPromotionDescription || t('n/a'),
            [ValidatorFields.STAKE_SHARE]: stakedTotalPercentage(stakeScore),
            [ValidatorFields.STAKED_BY_DELEGATES]: formatNumber(
              toBigNum(stakedByDelegates, decimals),
              2
            ),
            [ValidatorFields.STAKED_BY_OPERATOR]: formatNumber(
              toBigNum(stakedByOperator, decimals),
              2
            ),
            [ValidatorFields.PERFORMANCE_SCORE]:
              getFormattedPerformanceScore(performanceScore).toString(),
            [ValidatorFields.PERFORMANCE_PENALTY]: formatNumberPercentage(
              calculatesPerformancePenalty(performanceScore),
              2
            ),
            [ValidatorFields.OVERSTAKING_PENALTY]: formatNumberPercentage(
              calculateOverstakedPenalty(id, allNodesInPreviousEpoch),
              2
            ),
            [ValidatorFields.TOTAL_PENALTIES]: formatNumberPercentage(
              calculateOverallPenalty(id, allNodesInPreviousEpoch),
              2
            ),
            [ValidatorFields.PENDING_STAKE]: pendingStake,
            [ValidatorFields.STAKED_BY_USER]: stakedByUser
              ? formatNumber(toBigNum(stakedByUser, decimals), 2)
              : undefined,
            [ValidatorFields.PENDING_USER_STAKE]: pendingUserStake,
            [ValidatorFields.USER_STAKE_SHARE]: userStakeShare
              ? formatNumberPercentage(new BigNumber(userStakeShare), 2)
              : undefined,
          };
        }
      );
  }, [
    allNodesInPreviousEpoch,
    data,
    decimals,
    previousEpochData,
    stakeNeededForPromotion,
    stakeNeededForPromotionDescription,
    t,
  ]);

  if (validatorsView === 'myStake') {
    nodes = nodes.filter(
      (node) => node[ValidatorFields.STAKED_BY_USER] !== undefined
    );
  }

  const StandbyPendingTable = forwardRef<AgGridReact>((_, gridRef) => {
    const colDefs = useMemo<ColDef[]>(
      () => [
        {
          field: ValidatorFields.RANKING_INDEX,
          headerName: '#',
          width: 60,
          pinned: 'left',
        },
        {
          field: ValidatorFields.VALIDATOR,
          headerName: t(ValidatorFields.VALIDATOR).toString(),
          cellRenderer: ValidatorRenderer,
          comparator: ({ name: a }, { name: b }) => Math.sign(a - b),
          pinned: 'left',
          width: 260,
        },
        {
          field: ValidatorFields.STAKE,
          headerName: t(ValidatorFields.STAKE).toString(),
          headerTooltip: t('StakeDescription').toString(),
          cellRenderer: TotalStakeRenderer,
          width: 120,
          sort: 'desc',
        },
        {
          field: ValidatorFields.PENDING_STAKE,
          headerName: t(ValidatorFields.PENDING_STAKE).toString(),
          headerTooltip: t('PendingStakeDescription').toString(),
          cellRenderer: PendingStakeRenderer,
          width: 120,
        },
        {
          field: ValidatorFields.STAKE_SHARE,
          headerName: t(ValidatorFields.STAKE_SHARE).toString(),
          headerTooltip: t('StakeShareDescription').toString(),
          cellRenderer: StakeShareRenderer,
          width: 120,
        },
        {
          field: ValidatorFields.NORMALISED_VOTING_POWER,
          headerName: t('votingPower').toString(),
          headerTooltip: t('NonConsensusVotingPowerDescription').toString(),
          cellRenderer: VotingPowerRenderer,
          width: 120,
        },
        // {
        //   field: ValidatorFields.STAKE_NEEDED_FOR_PROMOTION,
        //   headerName: t(ValidatorFields.STAKE_NEEDED_FOR_PROMOTION).toString(),
        //   headerTooltip: t(stakeNeededForPromotionDescription, {
        //     prefix: t('The'),
        //   }),
        //   cellRenderer: StakeNeededForPromotionRenderer,
        //   width: 210,
        // },
        {
          field: ValidatorFields.TOTAL_PENALTIES,
          headerName: t(ValidatorFields.TOTAL_PENALTIES).toString(),
          headerTooltip: t('TotalPenaltiesDescription').toString(),
          cellRenderer: TotalPenaltiesRenderer,
          width: 120 + 210,
        },
      ],
      []
    );

    return (
      <div
        data-testid="standby-pending-validators-table"
        className="validators-table"
      >
        <AgGrid
          domLayout="autoHeight"
          style={{ width: '100%' }}
          rowHeight={68}
          defaultColDef={defaultColDef}
          tooltipShowDelay={0}
          animateRows={true}
          suppressCellFocus={true}
          overlayNoRowsTemplate={t('noValidators')}
          ref={gridRef}
          rowData={nodes}
          columnDefs={colDefs}
          onCellClicked={(event) => {
            navigate(event.data.id);
          }}
        />
      </div>
    );
  });

  return <StandbyPendingTable ref={gridRef} />;
};

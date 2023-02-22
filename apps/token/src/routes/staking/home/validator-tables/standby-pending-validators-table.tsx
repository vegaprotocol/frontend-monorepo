import { forwardRef, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import { useAppState } from '../../../../contexts/app-state/app-state-context';
import { BigNumber } from '../../../../lib/bignumber';
import {
  getFormattedPerformanceScore,
  getLastEpochScoreAndPerformance,
  getOverstakedAmount,
  getOverstakingPenalty,
  getPerformancePenalty,
  getTotalPenalties,
} from '../../shared';
import {
  defaultColDef,
  NODE_LIST_GRID_STYLES,
  StakeNeededForPromotionRenderer,
  stakedTotalPercentage,
  ValidatorFields,
  ValidatorRenderer,
  TotalPenaltiesRenderer,
  TotalStakeRenderer,
} from './shared';
import type { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';
import type { ValidatorsTableProps } from './shared';
import { formatNumber, toBigNum } from '@vegaprotocol/react-helpers';

interface StandbyPendingValidatorsTableProps extends ValidatorsTableProps {
  stakeNeededForPromotion: string | undefined;
  stakeNeededForPromotionDescription: string;
}

export const StandbyPendingValidatorsTable = ({
  data,
  previousEpochData,
  totalStake,
  stakeNeededForPromotion,
  stakeNeededForPromotionDescription,
}: StandbyPendingValidatorsTableProps) => {
  const { t } = useTranslation();
  const {
    appState: { decimals },
  } = useAppState();
  const navigate = useNavigate();

  const gridRef = useRef<AgGridReact | null>(null);

  const nodes = useMemo(() => {
    if (!data) return [];

    return data
      .sort((a, b) => {
        const aVotingPower = new BigNumber(a.rankingScore.votingPower);
        const bVotingPower = new BigNumber(b.rankingScore.votingPower);
        return bVotingPower.minus(aVotingPower).toNumber();
      })
      .map((node, index) => {
        const votingPowerRanking = index + 1;

        return {
          ...node,
          votingPowerRanking,
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
          rankingScore: { stakeScore },
          pendingStake,
          votingPowerRanking,
        }) => {
          const { rawValidatorScore, performanceScore } =
            getLastEpochScoreAndPerformance(previousEpochData, id);

          const overstakedAmount = getOverstakedAmount(
            rawValidatorScore,
            stakedTotal,
            totalStake
          );
          let individualStakeNeededForPromotion,
            individualStakeNeededForPromotionDescription;

          if (stakeNeededForPromotion && performanceScore) {
            const stakedTotalBigNum = new BigNumber(stakedTotal);
            const stakeNeededBigNum = new BigNumber(stakeNeededForPromotion);
            const performanceScoreBigNum = new BigNumber(performanceScore);

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
            [ValidatorFields.RANKING_INDEX]: votingPowerRanking,
            [ValidatorFields.VALIDATOR]: {
              avatarUrl,
              name,
            },
            [ValidatorFields.STAKE]: formatNumber(
              toBigNum(stakedTotal, decimals),
              2
            ),
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
            [ValidatorFields.PERFORMANCE_PENALTY]:
              getPerformancePenalty(performanceScore),
            [ValidatorFields.OVERSTAKED_AMOUNT]: overstakedAmount.toString(),
            [ValidatorFields.OVERSTAKING_PENALTY]: getOverstakingPenalty(
              overstakedAmount,
              totalStake
            ),
            [ValidatorFields.TOTAL_PENALTIES]: getTotalPenalties(
              rawValidatorScore,
              performanceScore,
              stakedTotal,
              totalStake
            ),
            [ValidatorFields.PENDING_STAKE]: formatNumber(
              toBigNum(pendingStake, decimals),
              2
            ),
          };
        }
      );
  }, [
    data,
    decimals,
    previousEpochData,
    stakeNeededForPromotion,
    stakeNeededForPromotionDescription,
    t,
    totalStake,
  ]);

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
          width: 240,
        },
        {
          field: ValidatorFields.STAKE,
          headerName: t(ValidatorFields.STAKE).toString(),
          headerTooltip: t('StakeDescription').toString(),
          cellRenderer: TotalStakeRenderer,
          width: 120,
        },
        {
          field: ValidatorFields.STAKE_NEEDED_FOR_PROMOTION,
          headerName: t(ValidatorFields.STAKE_NEEDED_FOR_PROMOTION).toString(),
          headerTooltip: t(stakeNeededForPromotionDescription, {
            prefix: t('The'),
          }),
          cellRenderer: StakeNeededForPromotionRenderer,
          width: 210,
          sort: 'asc',
        },
        {
          field: ValidatorFields.STAKE_SHARE,
          headerName: t(ValidatorFields.STAKE_SHARE).toString(),
          headerTooltip: t('StakeShareDescription').toString(),
          width: 100,
        },
        {
          field: ValidatorFields.TOTAL_PENALTIES,
          headerName: t(ValidatorFields.TOTAL_PENALTIES).toString(),
          headerTooltip: t('TotalPenaltiesDescription').toString(),
          cellRenderer: TotalPenaltiesRenderer,
          width: 120,
        },
        {
          field: ValidatorFields.PENDING_STAKE,
          headerName: t(ValidatorFields.PENDING_STAKE).toString(),
          headerTooltip: t('PendingStakeDescription').toString(),
          width: 110,
        },
      ],
      []
    );

    return (
      <div data-testid="standby-pending-validators-table">
        <AgGrid
          domLayout="autoHeight"
          style={{ width: '100%' }}
          customThemeParams={NODE_LIST_GRID_STYLES}
          rowHeight={52}
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

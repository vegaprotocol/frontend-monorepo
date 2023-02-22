import type { Dispatch, SetStateAction } from 'react';
import { forwardRef, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AgGridDynamic as AgGrid, Button } from '@vegaprotocol/ui-toolkit';
import { useAppState } from '../../../../contexts/app-state/app-state-context';
import { BigNumber } from '../../../../lib/bignumber';
import {
  getFormattedPerformanceScore,
  getLastEpochScoreAndPerformance,
  getNormalisedVotingPower,
  getOverstakedAmount,
  getOverstakingPenalty,
  getPerformancePenalty,
  getTotalPenalties,
  getUnnormalisedVotingPower,
} from '../../shared';
import {
  defaultColDef,
  NODE_LIST_GRID_STYLES,
  stakedTotalPercentage,
  TotalPenaltiesRenderer,
  TotalStakeRenderer,
  ValidatorFields,
  ValidatorRenderer,
  VotingPowerRenderer,
} from './shared';
import type { AgGridReact } from 'ag-grid-react';
import type { ColDef, RowHeightParams } from 'ag-grid-community';
import type { ValidatorsTableProps } from './shared';
import {
  formatNumber,
  formatNumberPercentage,
  toBigNum,
} from '@vegaprotocol/react-helpers';

interface CanonisedConsensusNodeProps {
  id: string;
  [ValidatorFields.RANKING_INDEX]: number;
  [ValidatorFields.VALIDATOR]: {
    avatarUrl: string | null | undefined;
    name: string;
  };
  [ValidatorFields.STAKE]: string;
  [ValidatorFields.NORMALISED_VOTING_POWER]: string;
  [ValidatorFields.UNNORMALISED_VOTING_POWER]: string | null;
  [ValidatorFields.STAKE_SHARE]: string;
  [ValidatorFields.STAKED_BY_DELEGATES]: string;
  [ValidatorFields.STAKED_BY_OPERATOR]: string;
  [ValidatorFields.PERFORMANCE_SCORE]: string;
  [ValidatorFields.PERFORMANCE_PENALTY]: string;
  [ValidatorFields.OVERSTAKED_AMOUNT]: string;
  [ValidatorFields.OVERSTAKING_PENALTY]: string;
  [ValidatorFields.TOTAL_PENALTIES]: string;
  [ValidatorFields.PENDING_STAKE]: string;
}

const getRowHeight = (params: RowHeightParams) => {
  if (params.data.placeholderForTopThird) {
    // Note: this value will change if the height of the top third cell renderer changes
    return 138;
  }
  return 52;
};

const TopThirdCellRenderer = (
  // @ts-ignore no exported type that matches params from AG-grid
  params,
  setHideTopThird: Dispatch<SetStateAction<boolean>>
) => {
  const { t } = useTranslation();

  return (
    <a
      href="/"
      onClick={(e) => {
        e.preventDefault();
        setHideTopThird(false);
      }}
      className="grid grid-cols-[60px_1fr] w-full h-full py-4 px-0 text-sm text-white text-center overflow-scroll"
    >
      <div className="text-xs text-left px-3">
        {params?.data?.rankingDisplay}
      </div>
      <div className="whitespace-normal px-3">
        <div className="mb-4">
          <Button
            data-testid="show-all-validators"
            rightIcon="arrow-right"
            className="inline-flex items-center"
          >
            {t('Reveal top validators')}
          </Button>
        </div>
        <p className="font-semibold text-white mb-0">
          {t(
            'Validators with too great a stake share will have the staking rewards for their delegators penalised.'
          )}
        </p>
        <p>
          {t(
            'To avoid penalties and increase decentralisation of the network, delegate to validators below.'
          )}
        </p>
      </div>
    </a>
  );
};

export const ConsensusValidatorsTable = ({
  data,
  previousEpochData,
  totalStake,
}: ValidatorsTableProps) => {
  const { t } = useTranslation();
  const {
    appState: { decimals },
  } = useAppState();
  const navigate = useNavigate();
  const [hideTopThird, setHideTopThird] = useState(true);

  const gridRef = useRef<AgGridReact | null>(null);

  const nodes = useMemo(() => {
    if (!data || !previousEpochData) return [];
    const canonisedNodes = data
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
          rankingScore: { stakeScore, votingPower },
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
            [ValidatorFields.NORMALISED_VOTING_POWER]:
              getNormalisedVotingPower(votingPower),
            [ValidatorFields.UNNORMALISED_VOTING_POWER]:
              getUnnormalisedVotingPower(rawValidatorScore),
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

    if (canonisedNodes.length < 3 || !hideTopThird) {
      return canonisedNodes;
    }

    // The point of identifying and hiding the group that could halt the network
    // is that we assume the top 1/3 of stake is held by considerably less than
    // 1/3 of the validators and we really want people not to stake any more to
    // that group, because we want to make it require as many difference
    // validators to collude as possible to halt the network, so we hide them.
    const { topThird, remaining } = canonisedNodes.reduce(
      (acc, node) => {
        if (acc.cumulativeScore < 100 / 3) {
          acc.cumulativeScore += parseFloat(
            node[ValidatorFields.NORMALISED_VOTING_POWER]
          );
          acc.topThird.push(node);
          return acc;
        }
        acc.remaining.push(node);
        return acc;
      },
      { topThird: [], remaining: [], cumulativeScore: 0 } as {
        topThird: CanonisedConsensusNodeProps[];
        remaining: CanonisedConsensusNodeProps[];
        cumulativeScore: number;
      }
    );

    // We need to combine the top third of validators into a single node, this
    // way the combined values can be passed to AG grid so that the combined cell's
    // values are correct for ordering.
    const combinedTopThird = topThird.reduce((acc, node) => {
      const {
        [ValidatorFields.STAKE]: stake,
        [ValidatorFields.STAKE_SHARE]: stakeShare,
        [ValidatorFields.PENDING_STAKE]: pendingStake,
        [ValidatorFields.NORMALISED_VOTING_POWER]: normalisedVotingPower,
        [ValidatorFields.TOTAL_PENALTIES]: totalPenalties,
      } = node;

      const {
        [ValidatorFields.STAKE]: accStake,
        [ValidatorFields.STAKE_SHARE]: accStakeShare,
        [ValidatorFields.PENDING_STAKE]: accPendingStake,
        [ValidatorFields.NORMALISED_VOTING_POWER]: accNormalisedVotingPower,
        [ValidatorFields.TOTAL_PENALTIES]: accTotalPenalties,
      } = acc;

      return {
        ...acc,
        [ValidatorFields.STAKE]: formatNumber(
          toBigNum(accStake, decimals).plus(toBigNum(stake, decimals)),
          2
        ),
        [ValidatorFields.STAKE_SHARE]: formatNumberPercentage(
          new BigNumber(parseFloat(accStakeShare)).plus(
            new BigNumber(parseFloat(stakeShare))
          ),
          2
        ),
        [ValidatorFields.PENDING_STAKE]: formatNumber(
          toBigNum(accPendingStake, decimals).plus(
            toBigNum(pendingStake, decimals)
          ),
          2
        ),
        [ValidatorFields.NORMALISED_VOTING_POWER]: formatNumberPercentage(
          new BigNumber(parseFloat(accNormalisedVotingPower)).plus(
            new BigNumber(parseFloat(normalisedVotingPower))
          ),
          2
        ),
        [ValidatorFields.TOTAL_PENALTIES]: formatNumberPercentage(
          new BigNumber(parseFloat(accTotalPenalties)).plus(
            new BigNumber(parseFloat(totalPenalties))
          ),
          2
        ),
      };
    });

    return [
      {
        placeholderForTopThird: true,
        rankingDisplay: topThird.length === 1 ? '1' : `1 - ${topThird.length}`,
        ...combinedTopThird,
      },
      ...remaining,
    ];
  }, [data, decimals, hideTopThird, previousEpochData, totalStake]);

  const ConsensusTable = forwardRef<AgGridReact>((_, gridRef) => {
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
          comparator: ({ name: a }, { name: b }) => {
            if (a === b) return 0;
            return a > b ? 1 : -1;
          },
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
          field: ValidatorFields.NORMALISED_VOTING_POWER,
          headerName: t(ValidatorFields.NORMALISED_VOTING_POWER).toString(),
          headerTooltip: t('NormalisedVotingPowerDescription').toString(),
          cellRenderer: VotingPowerRenderer,
          width: 200,
          sort: 'desc',
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
      <div data-testid="consensus-validators-table">
        {nodes.length > 0 && (
          <AgGrid
            domLayout="autoHeight"
            style={{ width: '100%' }}
            customThemeParams={NODE_LIST_GRID_STYLES}
            getRowHeight={(params: RowHeightParams) => getRowHeight(params)}
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
            isFullWidthRow={(params) =>
              params.rowNode.data.placeholderForTopThird
            }
            // @ts-ignore no exported type that matches params from AG-grid
            fullWidthCellRenderer={(params) =>
              TopThirdCellRenderer(params, setHideTopThird)
            }
          />
        )}
      </div>
    );
  });

  return <ConsensusTable ref={gridRef} />;
};

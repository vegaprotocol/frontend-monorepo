import type { Dispatch, SetStateAction } from 'react';
import { forwardRef, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button, Icon } from '@vegaprotocol/ui-toolkit';
import { AgGrid } from '@vegaprotocol/datagrid';
import { useAppState } from '../../../../contexts/app-state/app-state-context';
import { BigNumber } from '../../../../lib/bignumber';
import {
  calculateOverallPenalty,
  calculateOverstakedPenalty,
  calculatesPerformancePenalty,
  getFormattedPerformanceScore,
  getLastEpochScoreAndPerformance,
  getNormalisedVotingPower,
  getUnnormalisedVotingPower,
} from '../../shared';
import {
  defaultColDef,
  PendingStakeRenderer,
  stakedTotalPercentage,
  StakeShareRenderer,
  TotalPenaltiesRenderer,
  TotalStakeRenderer,
  ValidatorFields,
  ValidatorRenderer,
  VotingPowerRenderer,
} from './shared';
import { type AgGridReact } from 'ag-grid-react';
import { type ColDef, type RowHeightParams } from 'ag-grid-community';
import { type ValidatorsTableProps } from './shared';
import {
  formatNumber,
  formatNumberPercentage,
  removePaginationWrapper,
  toBigNum,
} from '@vegaprotocol/utils';
import { VALIDATOR_LOGO_MAP } from './logo-map';
import { getMultisigStatusInfo } from '../../../../lib/get-multisig-status-info';

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
  [ValidatorFields.OVERSTAKING_PENALTY]: string;
  [ValidatorFields.TOTAL_PENALTIES]: string;
  [ValidatorFields.PENDING_STAKE]: string;
  [ValidatorFields.STAKED_BY_USER]: string | undefined;
  [ValidatorFields.PENDING_USER_STAKE]: string | undefined;
  [ValidatorFields.USER_STAKE_SHARE]: string | undefined;
}

const getRowHeight = (params: RowHeightParams) => {
  if (params.data.placeholderForTopThird) {
    // Note: this value will change if the height of the top third cell renderer changes
    return 138;
  }
  return 68;
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
      className="grid h-full w-full grid-cols-[60px_1fr] overflow-scroll px-0 py-4 text-center text-sm text-white"
    >
      <div className="px-3 text-left text-xs">
        {params?.data?.rankingDisplay}
      </div>
      <div className="whitespace-normal px-3">
        <div className="mb-4">
          <Button
            data-testid="show-all-validators"
            rightIcon={
              <Icon
                name="arrow-right"
                className="mr-2 fill-current align-text-top"
              />
            }
            className="inline-flex items-center"
          >
            {t('Reveal top validators')}
          </Button>
        </div>
        <p className="mb-0 font-semibold text-white">
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
  validatorsView,
}: ValidatorsTableProps) => {
  const { t } = useTranslation();
  const {
    appState: { decimals },
  } = useAppState();
  const navigate = useNavigate();
  const [hideTopThird, setHideTopThird] = useState(true);

  const gridRef = useRef<AgGridReact | null>(null);

  const thirdOfTotalStake = useMemo(
    () => new BigNumber(totalStake).dividedBy(3),
    [totalStake]
  );

  const multisigStatus = previousEpochData
    ? getMultisigStatusInfo(previousEpochData)
    : undefined;

  const allNodesInPreviousEpoch = removePaginationWrapper(
    previousEpochData?.epoch.validatorsConnection?.edges
  );

  const nodes = useMemo(() => {
    if (!data) return [];
    let canonisedNodes = data
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
          rankingScore: { stakeScore, votingPower, performanceScore },
          pendingStake,
          stakedTotalRanking,
          stakedByUser,
          pendingUserStake,
          userStakeShare,
        }) => {
          const logo = VALIDATOR_LOGO_MAP[id]
            ? VALIDATOR_LOGO_MAP[id]
            : avatarUrl
            ? avatarUrl
            : null;
          const { rawValidatorScore: previousEpochValidatorScore } =
            getLastEpochScoreAndPerformance(previousEpochData, id);

          return {
            id,
            [ValidatorFields.RANKING_INDEX]: stakedTotalRanking,
            [ValidatorFields.VALIDATOR]: {
              avatarUrl: logo,
              name,
            },
            [ValidatorFields.STAKE]: stakedTotal,
            [ValidatorFields.NORMALISED_VOTING_POWER]:
              getNormalisedVotingPower(votingPower),
            [ValidatorFields.UNNORMALISED_VOTING_POWER]:
              getUnnormalisedVotingPower(previousEpochValidatorScore),
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
            [ValidatorFields.MULTISIG_ERROR]:
              multisigStatus?.showMultisigStatusError,
          };
        }
      );

    if (validatorsView === 'myStake') {
      canonisedNodes = canonisedNodes.filter(
        (node) => node[ValidatorFields.STAKED_BY_USER] !== undefined
      );
    }

    if (
      canonisedNodes.length < 3 ||
      !hideTopThird ||
      validatorsView === 'myStake'
    ) {
      return canonisedNodes;
    }

    const { topThird, remaining } = canonisedNodes.reduce(
      (acc, node) => {
        if (acc.cumulativeScore.isLessThan(thirdOfTotalStake)) {
          const prev = acc.cumulativeScore;
          acc.cumulativeScore = prev.plus(
            new BigNumber(node[ValidatorFields.STAKE])
          );
          acc.topThird.push(node);
          return acc;
        }
        acc.remaining.push(node);
        return acc;
      },
      { topThird: [], remaining: [], cumulativeScore: new BigNumber(0) } as {
        topThird: CanonisedConsensusNodeProps[];
        remaining: CanonisedConsensusNodeProps[];
        cumulativeScore: BigNumber;
      }
    );

    // We need to combine the top third of validators into a single node, this
    // way the combined values can be passed to AG grid so that the combined cell's
    // values are correct for ordering.
    const combinedTopThird = topThird.reduce(
      (acc, node) => {
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
          [ValidatorFields.STAKE]: new BigNumber(accStake)
            .plus(new BigNumber(stake))
            .toString(),
          [ValidatorFields.STAKE_SHARE]: formatNumberPercentage(
            new BigNumber(parseFloat(accStakeShare)).plus(
              new BigNumber(parseFloat(stakeShare))
            ),
            2
          ),
          [ValidatorFields.PENDING_STAKE]: toBigNum(accPendingStake, decimals)
            .plus(toBigNum(pendingStake, decimals))
            .toString(),
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
      },
      {
        [ValidatorFields.STAKE]: '0',
        [ValidatorFields.STAKE_SHARE]: '0',
        [ValidatorFields.PENDING_STAKE]: '0',
        [ValidatorFields.NORMALISED_VOTING_POWER]: '0',
        [ValidatorFields.TOTAL_PENALTIES]: '0',
      }
    );

    return [
      {
        placeholderForTopThird: true,
        rankingDisplay: topThird.length === 1 ? '1' : `1 - ${topThird.length}`,
        ...combinedTopThird,
      },
      ...remaining,
    ];
  }, [
    allNodesInPreviousEpoch,
    data,
    decimals,
    hideTopThird,
    multisigStatus?.showMultisigStatusError,
    previousEpochData,
    thirdOfTotalStake,
    validatorsView,
  ]);

  const ConsensusTable = forwardRef<AgGridReact>((_, gridRef) => {
    const colDefs = useMemo<ColDef[]>(
      () => [
        {
          field: ValidatorFields.RANKING_INDEX,
          headerName: '#',
          width: 60,
        },
        {
          field: ValidatorFields.VALIDATOR,
          headerName: t(ValidatorFields.VALIDATOR).toString(),
          cellRenderer: ValidatorRenderer,
          comparator: ({ name: a }, { name: b }) => {
            if (a === b) return 0;
            return a > b ? 1 : -1;
          },
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
          headerTooltip: t('NormalisedVotingPowerDescription').toString(),
          cellRenderer: VotingPowerRenderer,
          width: 120,
        },
        {
          field: ValidatorFields.TOTAL_PENALTIES,
          headerName: t(ValidatorFields.TOTAL_PENALTIES).toString(),
          headerTooltip: t('TotalPenaltiesDescription').toString(),
          cellRenderer: TotalPenaltiesRenderer,
          width: 120,
        },
      ],
      []
    );

    return (
      <div
        data-testid="consensus-validators-table"
        className="validators-table"
      >
        {nodes.length > 0 && (
          <AgGrid
            domLayout="autoHeight"
            style={{ width: '100%' }}
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

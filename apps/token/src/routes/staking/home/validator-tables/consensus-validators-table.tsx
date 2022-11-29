import { forwardRef, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AgGridDynamic as AgGrid, Button } from '@vegaprotocol/ui-toolkit';
import { useAppState } from '../../../../contexts/app-state/app-state-context';
import {
  defaultColDef,
  nodeListGridStyles,
  stakedTotalPercentage,
  totalPenalties,
  ValidatorFields,
  ValidatorRenderer,
} from './shared';
import type { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';
import type { ValidatorsTableProps } from './shared';
import { formatNumber, toBigNum } from '@vegaprotocol/react-helpers';

interface CanonisedConsensusNodeProps {
  id: string;
  [ValidatorFields.VALIDATOR]: {
    avatarUrl: string | null | undefined;
    name: string;
  };
  [ValidatorFields.STAKE]: string;
  [ValidatorFields.STAKE_SHARE]: string;
  [ValidatorFields.PENDING_STAKE]: string;
  [ValidatorFields.NORMALISED_VOTING_POWER]: string;
}

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
    if (!data) return [];

    const canonisedNodes = data
      .sort((a, b) => {
        const aVotingPower = toBigNum(a.rankingScore.votingPower, 0);
        const bVotingPower = toBigNum(b.rankingScore.votingPower, 0);
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
          stakedTotal,
          rankingScore: { stakeScore, votingPower, performanceScore },
          pendingStake,
          votingPowerRanking,
        }) => {
          const normalisedVotingPower =
            toBigNum(votingPower, 0).dividedBy(100).dp(2).toString() + '%';

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
            [ValidatorFields.NORMALISED_VOTING_POWER]: normalisedVotingPower,
            [ValidatorFields.STAKE_SHARE]: stakedTotalPercentage(stakeScore),
            [ValidatorFields.TOTAL_PENALTIES]: totalPenalties(
              previousEpochData,
              id,
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
    const removeTopThirdOfStakeScores = canonisedNodes.reduce(
      (acc, node) => {
        if (acc.cumulativeScore < 3333) {
          acc.cumulativeScore += Number(
            node[ValidatorFields.NORMALISED_VOTING_POWER]
          );
          return acc;
        }
        acc.remaining.push(node);
        return acc;
      },
      { remaining: [], cumulativeScore: 0 } as {
        remaining: CanonisedConsensusNodeProps[];
        cumulativeScore: number;
      }
    );

    return removeTopThirdOfStakeScores.remaining;
  }, [data, decimals, hideTopThird, previousEpochData, totalStake]);

  const ConsensusTable = forwardRef<AgGridReact>((_, gridRef) => {
    const colDefs = useMemo<ColDef[]>(
      () => [
        {
          field: ValidatorFields.RANKING_INDEX,
          headerName: '#',
          width: 40,
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
          width: 120,
        },
        {
          field: ValidatorFields.NORMALISED_VOTING_POWER,
          headerName: t(ValidatorFields.NORMALISED_VOTING_POWER).toString(),
          width: 200,
          sort: 'desc',
        },
        {
          field: ValidatorFields.STAKE_SHARE,
          headerName: t(ValidatorFields.STAKE_SHARE).toString(),
          width: 100,
        },
        {
          field: ValidatorFields.TOTAL_PENALTIES,
          headerName: t(ValidatorFields.TOTAL_PENALTIES).toString(),
          width: 120,
        },
        {
          field: ValidatorFields.PENDING_STAKE,
          headerName: t(ValidatorFields.PENDING_STAKE).toString(),
          width: 110,
        },
      ],
      []
    );

    return (
      <div data-testid="consensus-validators-table">
        {hideTopThird && (
          <div className="mb-6 py-4 px-4 md:px-12 bg-neutral-900  text-sm text-center">
            <div className="mb-4">
              <Button
                data-testid="show-all-validators"
                icon="list"
                className="inline-flex items-center"
                onClick={() => setHideTopThird(false)}
              >
                {t('Reveal top validators')}
              </Button>
            </div>
            <p className="font-semibold">
              {t(
                'Validators with too great a stake share will have the staking rewards for their delegators penalised.'
              )}
            </p>
            <p className="mb-0">
              {t(
                'To avoid penalties and increase decentralisation of the network, delegate to validators below.'
              )}
            </p>
          </div>
        )}
        {nodes.length > 0 && (
          <AgGrid
            domLayout="autoHeight"
            style={{ width: '100%' }}
            customThemeParams={nodeListGridStyles}
            rowHeight={52}
            defaultColDef={defaultColDef}
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
        )}
      </div>
    );
  });

  return <ConsensusTable ref={gridRef} />;
};

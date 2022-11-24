import { useTranslation } from 'react-i18next';
import compact from 'lodash/compact';
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import type { AgGridReact } from 'ag-grid-react';
import { useNavigate } from 'react-router-dom';
import {
  AgGridDynamic as AgGrid,
  AsyncRenderer,
  Button,
} from '@vegaprotocol/ui-toolkit';
import { EpochCountdown } from '../../../components/epoch-countdown';
import { BigNumber } from '../../../lib/bignumber';
import { formatNumber, toBigNum } from '@vegaprotocol/react-helpers';
import { Schema } from '@vegaprotocol/types';
import type { ColDef } from 'ag-grid-community';
import { useNodesQuery } from './__generated___/Nodes';
import { usePreviousEpochQuery } from './__generated___/PreviousEpoch';
import { useAppState } from '../../../contexts/app-state/app-state-context';

const VALIDATOR = 'validator';
const STAKE = 'stake';
const PENDING_STAKE = 'pendingStake';
const STAKE_SHARE = 'stakeShare';
const TOTAL_PENALTIES = 'totalPenalties';
const NORMALISED_VOTING_POWER = 'normalisedVotingPower';
const STAKE_NEEDED_FOR_PROMOTION = 'stakeNeededForPromotion';

interface ValidatorRendererProps {
  data: { validator: { avatarUrl: string; name: string } };
}

interface CanonisedNodeProps {
  id: string;
  [VALIDATOR]: {
    avatarUrl: string | null | undefined;
    name: string;
  };
  [STAKE]: string;
  [STAKE_SHARE]: string;
  [PENDING_STAKE]: string;
  [NORMALISED_VOTING_POWER]: string;
}

export const statusTranslationKey = (status: Schema.ValidatorStatus) => {
  // Returns a key for translation
  const statuses = {
    [Schema.ValidatorStatus.VALIDATOR_NODE_STATUS_ERSATZ]: 'status-ersatz',
    [Schema.ValidatorStatus.VALIDATOR_NODE_STATUS_PENDING]: 'status-pending',
    [Schema.ValidatorStatus.VALIDATOR_NODE_STATUS_TENDERMINT]:
      'status-tendermint',
  };

  return statuses[status];
};

const ValidatorRenderer = ({ data }: ValidatorRendererProps) => {
  const { avatarUrl, name } = data.validator;
  return (
    <div className="flex items-center">
      {avatarUrl && (
        <img
          className="h-6 w-6 rounded-full mr-2"
          src={avatarUrl}
          alt={`Avatar icon for ${name}`}
          onError={(e) => (e.currentTarget.style.display = 'none')}
        />
      )}
      {name}
    </div>
  );
};

// Custom styling to account for the scrollbar. This is needed because the
// AG Grid places the scrollbar over the bottom validator, which obstructs
const nodeListGridStyles = `
  .ag-theme-balham-dark .ag-body-horizontal-scroll {
    opacity: 0.75;
  }
`;

export const NodeList = () => {
  const { t } = useTranslation();
  // errorPolicy due to vegaprotocol/vega issue 5898
  const { data, error, loading, refetch } = useNodesQuery();
  const { data: previousEpochData, refetch: previousEpochRefetch } =
    usePreviousEpochQuery({
      variables: {
        epochId: (Number(data?.epoch.id) - 1).toString(),
      },
    });
  const navigate = useNavigate();
  const {
    appState: { decimals },
  } = useAppState();
  const [hideTopThird, setHideTopThird] = useState(true);

  useEffect(() => {
    const epochInterval = setInterval(() => {
      if (!data?.epoch.timestamps.expiry) return;
      const now = Date.now();
      const expiry = new Date(data.epoch.timestamps.expiry).getTime();

      if (now > expiry) {
        refetch();
        previousEpochRefetch({
          epochId: (Number(data?.epoch.id) - 1).toString(),
        });
        clearInterval(epochInterval);
      }
    }, 10000);

    return () => {
      clearInterval(epochInterval);
    };
  }, [
    data?.epoch.id,
    data?.epoch.timestamps.expiry,
    previousEpochRefetch,
    refetch,
  ]);

  const nodes = useMemo(() => {
    if (!data?.nodesConnection.edges) return [];

    const canonisedNodes = compact(data.nodesConnection.edges).map(
      ({
        node: {
          id,
          name,
          avatarUrl,
          stakedTotal,
          rankingScore: { stakeScore, votingPower },
          pendingStake,
        },
      }) => {
        const stakedTotalPercentage =
          toBigNum(stakeScore, 0).times(100).dp(2).toString() + '%';
        const normalisedVotingPower =
          toBigNum(votingPower, 0).dividedBy(100).dp(2).toString() + '%';
        const rawValidatorScore = previousEpochData
          ? compact(
              previousEpochData.epoch?.validatorsConnection?.edges?.map(
                (edge) => edge?.node
              )
            ).find((validator) => validator?.id === id)?.rewardScore
              ?.rawValidatorScore
          : null;
        const totalPenaltiesCalc =
          rawValidatorScore !== null
            ? 100 *
              Math.max(
                0,
                1 -
                  Number(rawValidatorScore) /
                    (Number(stakedTotal) /
                      Number(data?.nodeData?.stakedTotal || 0))
              )
            : null;
        const totalPenalties =
          totalPenaltiesCalc !== null
            ? toBigNum(totalPenaltiesCalc, 0).dp(2).toString() + '%'
            : t('noPenaltyDataFromLastEpoch');

        return {
          id,
          [VALIDATOR]: {
            avatarUrl,
            name,
          },
          [STAKE]: formatNumber(toBigNum(stakedTotal, decimals), 2),
          [STAKE_SHARE]: stakedTotalPercentage,
          [PENDING_STAKE]: formatNumber(toBigNum(pendingStake, decimals), 2),
          [NORMALISED_VOTING_POWER]: normalisedVotingPower,
          [TOTAL_PENALTIES]: totalPenalties,
        };
      }
    );

    if (canonisedNodes.length < 3 || !hideTopThird) {
      return canonisedNodes;
    }

    const sortedByVotingPower = canonisedNodes.sort(
      (a, b) =>
        new BigNumber(b[NORMALISED_VOTING_POWER]).toNumber() -
        new BigNumber(a[NORMALISED_VOTING_POWER]).toNumber()
    );

    // The point of identifying and hiding the group that could halt the network
    // is that we assume the top 1/3 of stake is held by considerably less than
    // 1/3 of the validators and we really want people not to stake any more to
    // that group, because we want to make it require as many difference
    // validators to collude as possible to halt the network, so we hide them.
    const removeTopThirdOfStakeScores = sortedByVotingPower.reduce(
      (acc, node) => {
        if (acc.cumulativeScore < 3333) {
          acc.cumulativeScore += Number(node[NORMALISED_VOTING_POWER]);
          return acc;
        }
        acc.remaining.push(node);
        return acc;
      },
      { remaining: [], cumulativeScore: 0 } as {
        remaining: CanonisedNodeProps[];
        cumulativeScore: number;
      }
    );

    return removeTopThirdOfStakeScores.remaining;
  }, [
    data?.nodeData?.stakedTotal,
    data?.nodesConnection.edges,
    decimals,
    hideTopThird,
    previousEpochData,
    t,
  ]);

  const gridRef = useRef<AgGridReact | null>(null);

  const NodeListTable = forwardRef<AgGridReact>((_, ref) => {
    const colDefs = useMemo<ColDef[]>(
      () => [
        {
          field: VALIDATOR,
          headerName: t('validator').toString(),
          cellRenderer: ValidatorRenderer,
          comparator: ({ name: a }, { name: b }) => {
            if (a === b) return 0;
            return a > b ? 1 : -1;
          },
          pinned: 'left',
        },
        {
          field: STAKE,
          headerName: t('stake').toString(),
          width: 120,
        },
        {
          field: STAKE_SHARE,
          headerName: t('stakeShare').toString(),
          width: 100,
        },
        {
          field: PENDING_STAKE,
          headerName: t('pendingStake').toString(),
          width: 110,
        },
        {
          field: NORMALISED_VOTING_POWER,
          headerName: t('normalisedVotingPower').toString(),
          width: 180,
          sort: 'desc',
        },
        {
          field: TOTAL_PENALTIES,
          headerName: t('totalPenalties').toString(),
          width: 120,
        },
      ],
      []
    );

    const defaultColDef = useMemo(
      () => ({
        sortable: true,
        resizable: true,
        comparator: (a: string, b: string) => parseFloat(a) - parseFloat(b),
        cellStyle: { margin: '10px 0' },
      }),
      []
    );

    return (
      <div data-testid="validators-grid">
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
        <AgGrid
          domLayout="autoHeight"
          style={{ width: '100%' }}
          customThemeParams={nodeListGridStyles}
          overlayNoRowsTemplate={t('noValidators')}
          ref={ref}
          rowData={nodes}
          rowHeight={52}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          animateRows={true}
          suppressCellFocus={true}
          onCellClicked={(event) => {
            navigate(event.data.id);
          }}
        />
      </div>
    );
  });

  return (
    <AsyncRenderer loading={loading} error={error} data={nodes}>
      {data?.epoch &&
        data.epoch.timestamps.start &&
        data?.epoch.timestamps.expiry && (
          <div className="mb-8">
            <EpochCountdown
              id={data.epoch.id}
              startDate={new Date(data.epoch.timestamps.start)}
              endDate={new Date(data.epoch.timestamps.expiry)}
            />
          </div>
        )}
      <NodeListTable ref={gridRef} />
    </AsyncRenderer>
  );
};

import compact from 'lodash/compact';
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import type { AgGridReact } from 'ag-grid-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { t } from '@vegaprotocol/react-helpers';
import {
  AgGridDynamic as AgGrid,
  AsyncRenderer,
  Button,
} from '@vegaprotocol/ui-toolkit';
import { EpochCountdown } from '../../../components/epoch-countdown';
import { BigNumber } from '../../../lib/bignumber';
import { formatNumber } from '@vegaprotocol/react-helpers';
import { Schema } from '@vegaprotocol/types';
import { useNodesQuery } from './__generated___/Nodes';
import type { ColDef } from 'ag-grid-community';

const VALIDATOR = 'validator';
const STATUS = 'status';
const TOTAL_STAKE_THIS_EPOCH = 'totalStakeThisEpoch';
const SHARE = 'share';
const VALIDATOR_STAKE = 'validatorStake';
const PENDING_STAKE = 'pendingStake';
const RANKING_SCORE = 'rankingScore';
const STAKE_SCORE = 'stakeScore';
const PERFORMANCE_SCORE = 'performanceScore';
const VOTING_POWER = 'votingPower';

interface ValidatorRendererProps {
  data: { validator: { avatarUrl: string; name: string } };
}

interface CanonisedNodeProps {
  id: string;
  [VALIDATOR]: {
    avatarUrl: string | null | undefined;
    name: string;
  };
  [STATUS]: string;
  [TOTAL_STAKE_THIS_EPOCH]: string;
  [SHARE]: string;
  [VALIDATOR_STAKE]: string;
  [PENDING_STAKE]: string;
  [RANKING_SCORE]: string;
  [STAKE_SCORE]: string;
  [PERFORMANCE_SCORE]: string;
  [VOTING_POWER]: string;
}

export const translateStatus = (status: Schema.ValidatorStatus) =>
  t(
    `${
      (status === Schema.ValidatorStatus.VALIDATOR_NODE_STATUS_ERSATZ &&
        'Standby') ||
      (status === Schema.ValidatorStatus.VALIDATOR_NODE_STATUS_PENDING &&
        'Pending') ||
      (status === Schema.ValidatorStatus.VALIDATOR_NODE_STATUS_TENDERMINT &&
        'Consensus')
    }`
  );

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
  // errorPolicy due to vegaprotocol/vega issue 5898
  const { data, error, loading, refetch } = useNodesQuery();
  const navigate = useNavigate();
  const [hideTopThird, setHideTopThird] = useState(true);

  useEffect(() => {
    const epochInterval = setInterval(() => {
      if (!data?.epoch.timestamps.expiry) return;
      const now = Date.now();
      const expiry = new Date(data.epoch.timestamps.expiry).getTime();

      if (now > expiry) {
        refetch();
        clearInterval(epochInterval);
      }
    }, 10000);

    return () => {
      clearInterval(epochInterval);
    };
  }, [data?.epoch.timestamps.expiry, refetch]);

  const nodes = useMemo(() => {
    if (!data?.nodesConnection.edges) return [];

    const canonisedNodes = compact(data.nodesConnection.edges).map(
      ({
        node: {
          id,
          name,
          avatarUrl,
          stakedTotalFormatted,
          rankingScore: {
            rankingScore,
            stakeScore,
            status,
            performanceScore,
            votingPower,
          },
          pendingStakeFormatted,
        },
      }) => {
        const stakedTotal = new BigNumber(
          data?.nodeData?.stakedTotalFormatted || 0
        );
        const stakedOnNode = new BigNumber(stakedTotalFormatted);
        const stakedTotalPercentage =
          stakedTotal.isEqualTo(0) || stakedOnNode.isEqualTo(0)
            ? '-'
            : stakedOnNode.dividedBy(stakedTotal).times(100).dp(2).toString() +
              '%';

        return {
          id,
          [VALIDATOR]: {
            avatarUrl,
            name,
          },
          [STATUS]: translateStatus(status),
          [TOTAL_STAKE_THIS_EPOCH]: formatNumber(stakedTotalFormatted, 2),
          [SHARE]: stakedTotalPercentage,
          [VALIDATOR_STAKE]: formatNumber(stakedOnNode, 2),
          [PENDING_STAKE]: formatNumber(pendingStakeFormatted, 2),
          [RANKING_SCORE]: formatNumber(new BigNumber(rankingScore), 5),
          [STAKE_SCORE]: formatNumber(new BigNumber(stakeScore), 5),
          [PERFORMANCE_SCORE]: formatNumber(new BigNumber(performanceScore), 5),
          [VOTING_POWER]: votingPower,
        };
      }
    );

    if (canonisedNodes.length < 3 || !hideTopThird) {
      return canonisedNodes;
    }

    const sortedByVotingPower = canonisedNodes.sort(
      (a, b) =>
        new BigNumber(b[VOTING_POWER]).toNumber() -
        new BigNumber(a[VOTING_POWER]).toNumber()
    );

    // The point of identifying and hiding the group that could halt the network
    // is that we assume the top 1/3 of stake is held by considerably less than
    // 1/3 of the validators and we really want people not to stake any more to
    // that group, because we want to make it require as many difference
    // validators to collude as possible to halt the network, so we hide them.
    const removeTopThirdOfStakeScores = sortedByVotingPower.reduce(
      (acc, node) => {
        if (acc.cumulativeScore < 3333) {
          acc.cumulativeScore += Number(node[VOTING_POWER]);
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
  }, [data, t, hideTopThird]);

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
          field: STATUS,
          headerName: t('status').toString(),
          comparator: (a, b) => {
            if (a === b) return 0;
            return a > b ? 1 : -1;
          },
          width: 100,
        },
        {
          field: TOTAL_STAKE_THIS_EPOCH,
          headerName: t('totalStakeThisEpoch').toString(),
          width: 160,
        },
        {
          field: SHARE,
          headerName: t('share').toString(),
          width: 80,
        },
        {
          field: VALIDATOR_STAKE,
          headerName: t('validatorStake').toString(),
          width: 120,
        },
        {
          field: PENDING_STAKE,
          headerName: t('nextEpoch').toString(),
          width: 100,
        },
        {
          field: RANKING_SCORE,
          headerName: t('rankingScore').toString(),
          width: 120,
          sort: 'desc',
        },
        {
          field: STAKE_SCORE,
          headerName: t('stakeScore').toString(),
          width: 100,
        },
        {
          field: PERFORMANCE_SCORE,
          headerName: t('performanceScore').toString(),
          width: 100,
        },
        {
          field: VOTING_POWER,
          headerName: t('votingPower').toString(),
          width: 100,
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

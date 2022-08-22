import { gql, useQuery } from '@apollo/client';
import { useEffect, useMemo, useRef, forwardRef } from 'react';
import {
  AgGridDynamic as AgGrid,
  AsyncRenderer,
} from '@vegaprotocol/ui-toolkit';
import type { AgGridReact } from 'ag-grid-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { EpochCountdown } from '../../components/epoch-countdown';
import { BigNumber } from '../../lib/bignumber';
import { formatNumber } from '@vegaprotocol/react-helpers';
import type { Nodes } from './__generated__/Nodes';
import type { Staking_epoch } from './__generated__/Staking';
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

export const NODES_QUERY = gql`
  query Nodes {
    nodes {
      avatarUrl
      id
      name
      pubkey
      stakedTotal
      stakedTotalFormatted @client
      pendingStake
      pendingStakeFormatted @client
      rankingScore {
        rankingScore
        stakeScore
        performanceScore
        votingPower
        status
      }
    }
    nodeData {
      stakedTotal
      stakedTotalFormatted @client
    }
  }
`;

interface NodeListProps {
  epoch: Staking_epoch | undefined;
}

interface ValidatorRendererProps {
  data: { validator: { avatarUrl: string; name: string } };
}

const ValidatorRenderer = ({ data }: ValidatorRendererProps) => {
  const { avatarUrl, name } = data.validator;
  return (
    <div className="flex items-center">
      {avatarUrl && (
        <img
          className="h-24 w-24 rounded-full mr-8"
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

export const NodeList = ({ epoch }: NodeListProps) => {
  const { t } = useTranslation();
  // errorPolicy due to vegaprotocol/vega issue 5898
  const { data, error, loading, refetch } = useQuery<Nodes>(NODES_QUERY, {
    errorPolicy: 'ignore',
  });
  const navigate = useNavigate();

  useEffect(() => {
    const epochInterval = setInterval(() => {
      if (!epoch?.timestamps.expiry) return;
      const now = Date.now();
      const expiry = new Date(epoch.timestamps.expiry).getTime();

      if (now > expiry) {
        refetch();
        clearInterval(epochInterval);
      }
    }, 10000);

    return () => {
      clearInterval(epochInterval);
    };
  }, [epoch?.timestamps.expiry, refetch]);

  const nodes = useMemo(() => {
    if (!data?.nodes) return [];

    return data.nodes.map(
      ({
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
        const statusTranslated = t(`status-${status}`);

        return {
          id,
          [VALIDATOR]: {
            avatarUrl,
            name,
          },
          [STATUS]: statusTranslated,
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
  }, [data, t]);

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
      }),
      []
    );

    return (
      <div data-testid="validators-grid">
        <AgGrid
          domLayout="autoHeight"
          style={{ width: '100%' }}
          customThemeParams={nodeListGridStyles}
          overlayNoRowsTemplate={t('noValidators')}
          ref={ref}
          rowData={nodes}
          rowHeight={32}
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
      {epoch && epoch.timestamps.start && epoch.timestamps.expiry && (
        <div className="mb-20">
          <EpochCountdown
            id={epoch.id}
            startDate={new Date(epoch.timestamps.start)}
            endDate={new Date(epoch.timestamps.expiry)}
          />
        </div>
      )}
      <NodeListTable ref={gridRef} />
    </AsyncRenderer>
  );
};

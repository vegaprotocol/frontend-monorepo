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
import { formatNumber } from '../../lib/format-number';
import type { Nodes } from './__generated__/Nodes';
import type { Staking_epoch } from './__generated__/Staking';

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
    epoch {
      timestamps {
        expiry
      }
    }
    nodes {
      avatarUrl
      id
      name
      pubkey
      stakedTotal
      stakedTotalFormatted @client
      pendingStake
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
    opacity: 0.25;
  }
`;

export const NodeList = ({ epoch }: NodeListProps) => {
  const { t } = useTranslation();
  const { data, error, loading, refetch } = useQuery<Nodes>(NODES_QUERY);
  const navigate = useNavigate();

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
        pendingStake,
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
          [TOTAL_STAKE_THIS_EPOCH]: formatNumber(stakedTotal, 2),
          [SHARE]: stakedTotalPercentage,
          [VALIDATOR_STAKE]: formatNumber(stakedOnNode, 2),
          [PENDING_STAKE]: pendingStake,
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
    const colDefs = useMemo(
      () => [
        {
          field: VALIDATOR,
          headerName: t('validator').toString(),
          cellRenderer: ValidatorRenderer,
        },
        { field: STATUS, headerName: t('status').toString() },
        {
          field: TOTAL_STAKE_THIS_EPOCH,
          headerName: t('totalStakeThisEpoch').toString(),
        },
        { field: SHARE, headerName: t('share').toString() },
        { field: VALIDATOR_STAKE, headerName: t('validatorStake').toString() },
        { field: PENDING_STAKE, headerName: t('nextEpoch').toString() },
        { field: RANKING_SCORE, headerName: t('rankingScore').toString() },
        { field: STAKE_SCORE, headerName: t('stakeScore').toString() },
        {
          field: PERFORMANCE_SCORE,
          headerName: t('performanceScore').toString(),
        },
        { field: VOTING_POWER, headerName: t('votingPower').toString() },
      ],
      []
    );

    const defaultColDef = useMemo(
      () => ({
        sortable: true,
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
          onGridReady={(event) => {
            event.columnApi.applyColumnState({
              state: [
                {
                  colId: t('rankingScore'),
                  sort: 'desc',
                },
              ],
            });
            event.columnApi.autoSizeAllColumns(false);
          }}
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
        <EpochCountdown
          id={epoch.id}
          startDate={new Date(epoch.timestamps.start)}
          endDate={new Date(epoch.timestamps.expiry)}
        />
      )}
      <NodeListTable ref={gridRef} />
    </AsyncRenderer>
  );
};

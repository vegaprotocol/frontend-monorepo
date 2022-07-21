import { gql, useQuery } from '@apollo/client';
import { useMemo, useRef, forwardRef } from 'react';
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
  data: { Validator: { avatarUrl: string; name: string } };
}

const ValidatorRenderer = ({ data }: ValidatorRendererProps) => {
  const { avatarUrl, name } = data.Validator;
  return (
    <div className="flex items-center">
      {avatarUrl && (
        <img
          className="h-28 w-28 rounded-full mr-8"
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
  const { data, error, loading } = useQuery<Nodes>(NODES_QUERY);
  const navigate = useNavigate();

  const nodes = useMemo(() => {
    if (!data?.nodes) return [];

    return data.nodes.map((node) => {
      const stakedTotal = new BigNumber(
        data?.nodeData?.stakedTotalFormatted || 0
      );
      const stakedOnNode = new BigNumber(node.stakedTotalFormatted);
      const stakedTotalPercentage =
        stakedTotal.isEqualTo(0) || stakedOnNode.isEqualTo(0)
          ? '-'
          : stakedOnNode.dividedBy(stakedTotal).times(100).dp(2).toString() +
            '%';
      const status = t(`status-${node.rankingScore.status}`);

      return {
        id: node.id,
        [t('validator')]: {
          avatarUrl: node.avatarUrl,
          name: node.name,
        },
        [t('totalStakeThisEpoch')]: formatNumber(stakedTotal, 2),
        [t('share')]: stakedTotalPercentage,
        [t('validatorStake')]: formatNumber(stakedOnNode, 2),
        [t('nextEpoch')]: node.pendingStake,
        [t('rankingScore')]: formatNumber(
          new BigNumber(node.rankingScore.rankingScore),
          5
        ),
        [t('stakeScore')]: formatNumber(
          new BigNumber(node.rankingScore.stakeScore),
          5
        ),
        [t('status')]: status,
        [t('performanceScore')]: formatNumber(
          new BigNumber(node.rankingScore.performanceScore),
          5
        ),
        [t('votingPower')]: node.rankingScore.votingPower,
      };
    });
  }, [data, t]);

  const gridRef = useRef<AgGridReact | null>(null);

  const NodeListTable = forwardRef<AgGridReact>((_, ref) => {
    const colDefs = useMemo(
      () => [
        { field: t('validator'), cellRenderer: ValidatorRenderer },
        { field: t('status') },
        { field: t('totalStakeThisEpoch') },
        { field: t('share') },
        { field: t('validatorStake') },
        { field: t('nextEpoch') },
        { field: t('rankingScore') },
        { field: t('stakeScore') },
        { field: t('performanceScore') },
        { field: t('votingPower') },
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
      <AgGrid
        domLayout="autoHeight"
        style={{ width: '100%', fontSize: '14px' }}
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

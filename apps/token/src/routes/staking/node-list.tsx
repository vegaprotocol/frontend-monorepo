import { gql, useQuery } from '@apollo/client';
import { useMemo, useRef, forwardRef } from 'react';
import {
  AgGridDynamic as AgGrid,
  AsyncRenderer,
} from '@vegaprotocol/ui-toolkit';
import type { AgGridReact } from 'ag-grid-react';
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

export const NodeList = ({ epoch }: NodeListProps) => {
  const { t } = useTranslation();
  const { data, error, loading } = useQuery<Nodes>(NODES_QUERY);

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

      return {
        id: node.id,
        [t('validator')]: {
          avatar: node.avatarUrl,
          name: node.name,
        },
        [t('totalStakeThisEpoch')]: formatNumber(stakedTotal, 2),
        [t('share')]: stakedTotalPercentage,
        [t('validatorStake')]: formatNumber(stakedOnNode, 2),
        [t('nextEpoch')]: node.pendingStake,
        [t('rankingScore')]: node.rankingScore.rankingScore,
        [t('stakeScore')]: node.rankingScore.stakeScore,
        [t('status')]: node.rankingScore.status,
        [t('performanceScore')]: node.rankingScore.performanceScore,
        [t('votingPower')]: node.rankingScore.votingPower,
      };
    });
  }, [data, t]);

  const gridRef = useRef<AgGridReact | null>(null);

  const NodeListTable = forwardRef<AgGridReact>((_, ref) => {
    const colDefs = useMemo(
      () => [
        { field: t('validator') },
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

    const nodeListStyles = `
    :root{ --ag-row-height: 100px }
    `;

    return (
      <AgGrid
        customThemeParams={nodeListStyles}
        domLayout="autoHeight"
        style={{ width: '100%' }}
        overlayNoRowsTemplate={t('noValidators')}
        ref={ref}
        rowData={nodes}
        columnDefs={colDefs}
        defaultColDef={defaultColDef}
        animateRows={true}
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

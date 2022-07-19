import { gql, useQuery } from '@apollo/client';
import { Callout, Intent } from '@vegaprotocol/ui-toolkit';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { EpochCountdown } from '../../components/epoch-countdown';
import { BigNumber } from '../../lib/bignumber';
import { formatNumber } from '../../lib/format-number';
import { truncateMiddle } from '../../lib/truncate-middle';
import type { Nodes, Nodes_nodes_rankingScore } from './__generated__/Nodes';
import type { Staking_epoch, Staking_party } from './__generated__/Staking';

export const NODES_QUERY = gql`
  query Nodes {
    nodes {
      id
      name
      pubkey
      infoUrl
      location
      stakedByOperator
      stakedByDelegates
      stakedTotal
      pendingStake
      stakedByOperatorFormatted @client
      stakedByDelegatesFormatted @client
      stakedTotalFormatted @client
      pendingStakeFormatted @client
      epochData {
        total
        offline
        online
      }
      status
      rankingScore {
        rankingScore
        stakeScore
        performanceScore
        votingPower
        stakeScore
      }
    }
    nodeData {
      stakedTotal
      stakedTotalFormatted @client
      totalNodes
      inactiveNodes
      validatingNodes
      uptime
    }
  }
`;

const NodeListItemName = ({ children }: { children: React.ReactNode }) => (
  <span className="mr-4 underline text-white">{children}</span>
);

const NodeListTr = ({ children }: { children: React.ReactNode }) => (
  <tr className="flex">{children}</tr>
);

const NodeListTh = ({ children }: { children: React.ReactNode }) => (
  <th
    role="rowheader"
    className="flex-1 break-words py-1 pr-4 pl-0 text-white-60 font-normal"
  >
    {children}
  </th>
);

const NodeListTd = ({ children }: { children: React.ReactNode }) => (
  <td className="flex-1 break-words py-1 px-4 font-mono text-right">
    {children}
  </td>
);

interface NodeListProps {
  epoch: Staking_epoch | undefined;
}

export const NodeList = ({ epoch }: NodeListProps) => {
  const { t } = useTranslation();
  const { data, error, loading } = useQuery<Nodes>(NODES_QUERY);

  const nodes = React.useMemo<NodeListItemProps[]>(() => {
    if (!data?.nodes) return [];

    const nodesWithPercentages = data.nodes.map((node) => {
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
        name: node.name,
        pubkey: node.pubkey,
        stakedTotal,
        stakedOnNode,
        stakedTotalPercentage,
        epoch,
        scores: node.rankingScore,
      };
    });

    return nodesWithPercentages;
  }, [data, epoch]);

  if (error) {
    return (
      <Callout intent={Intent.Danger} title={t('Something went wrong')}>
        <pre>{error.message}</pre>
      </Callout>
    );
  }

  if (loading) {
    return (
      <div>
        <p>{t('Loading')}</p>
      </div>
    );
  }

  return (
    <>
      {epoch && epoch.timestamps.start && epoch.timestamps.expiry && (
        <EpochCountdown
          id={epoch.id}
          startDate={new Date(epoch.timestamps.start)}
          endDate={new Date(epoch.timestamps.expiry)}
        />
      )}
      <ul role="list" className="mt-24">
        {nodes.map((n, i) => {
          return <NodeListItem key={i} {...n} />;
        })}
      </ul>
    </>
  );
};

export interface NodeListItemProps {
  id: string;
  name: string;
  stakedOnNode: BigNumber;
  stakedTotalPercentage: string;
  scores: Nodes_nodes_rankingScore;
}

export const NodeListItem = ({
  id,
  name,
  stakedOnNode,
  stakedTotalPercentage,
  scores,
}: NodeListItemProps) => {
  const { t } = useTranslation();

  return (
    <li
      className="break-words flex flex-col justify-between mb-16 last:mb-0"
      data-testid="node-list-item"
    >
      <Link to={id}>
        {name ? (
          <NodeListItemName>{name}</NodeListItemName>
        ) : (
          <>
            <NodeListItemName>{t('validatorTitleFallback')}</NodeListItemName>
            <span
              className="uppercase text-white-60"
              title={`${t('id')}: ${id}`}
              data-testid="node-list-item-name"
            >
              {truncateMiddle(id)}
            </span>
          </>
        )}
      </Link>
      <table
        className="flex-1 text-body border-collapse mt-4"
        data-testid="node-list-item-table"
      >
        <tbody>
          <NodeListTr>
            <NodeListTh>{t('Total stake')}</NodeListTh>
            <NodeListTd>
              {formatNumber(stakedOnNode, 2)} ({stakedTotalPercentage})
            </NodeListTd>
          </NodeListTr>
          {scores
            ? Object.entries(scores)
                .filter(([key]) => key !== '__typename')
                .map(([key, value]) => (
                  <NodeListTr key={`${id}_${key}`}>
                    <NodeListTh>{t(key)}</NodeListTh>
                    <NodeListTd>
                      {formatNumber(new BigNumber(value), 4)}
                    </NodeListTd>
                  </NodeListTr>
                ))
            : null}
        </tbody>
      </table>
    </li>
  );
};

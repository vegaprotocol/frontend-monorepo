import "./node-list.scss";

import { gql, useQuery } from "@apollo/client";
import { Callout } from "@vegaprotocol/ui-toolkit";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link, useRouteMatch } from "react-router-dom";

import { EpochCountdown } from "../../components/epoch-countdown";
import { BigNumber } from "../../lib/bignumber";
import { formatNumber } from "../../lib/format-number";
import { truncateMiddle } from "../../lib/truncate-middle";
import { Nodes } from "./__generated__/Nodes";
import { Staking_epoch, Staking_party } from "./__generated__/Staking";

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

interface NodeListProps {
  epoch: Staking_epoch | undefined;
  party: Staking_party | null | undefined;
}

export const NodeList = ({ epoch, party }: NodeListProps) => {
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
          ? "-"
          : stakedOnNode.dividedBy(stakedTotal).times(100).dp(2).toString() +
            "%";

      const userStake = party?.delegations?.length
        ? party?.delegations
            ?.filter((d) => d.node.id === node.id)
            ?.filter((d) => d.epoch === Number(epoch?.id))
            .reduce((sum, d) => {
              const value = new BigNumber(d.amountFormatted);
              return sum.plus(value);
            }, new BigNumber(0))
        : new BigNumber(0);

      const userStakePercentage =
        userStake.isEqualTo(0) || stakedOnNode.isEqualTo(0)
          ? "-"
          : userStake.dividedBy(stakedOnNode).times(100).dp(2).toString() + "%";

      return {
        id: node.id,
        name: node.name,
        pubkey: node.pubkey,
        stakedTotal,
        stakedOnNode,
        stakedTotalPercentage,
        userStake,
        userStakePercentage,
        epoch,
      };
    });

    return nodesWithPercentages;
  }, [data, epoch, party]);

  if (error) {
    return (
      <Callout intent="error" title={t("Something went wrong")}>
        <pre>{error.message}</pre>
      </Callout>
    );
  }

  if (loading) {
    return (
      <div>
        <p>{t("Loading")}</p>
      </div>
    );
  }

  return (
    <>
      {epoch && epoch.timestamps.start && epoch.timestamps.expiry && (
        <EpochCountdown
          containerClass="staking-node__epoch"
          id={epoch.id}
          startDate={new Date(epoch.timestamps.start)}
          endDate={new Date(epoch.timestamps.expiry)}
        />
      )}
      <ul className="node-list">
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
  userStake: BigNumber;
  userStakePercentage: string;
}

export const NodeListItem = ({
  id,
  name,
  stakedOnNode,
  stakedTotalPercentage,
  userStake,
  userStakePercentage,
}: NodeListItemProps) => {
  const { t } = useTranslation();
  const match = useRouteMatch();

  return (
    <li data-testid="node-list-item">
      <Link to={`${match.path}/${id}`}>
        {name ? (
          <span className="node-list__item-name">{name}</span>
        ) : (
          <>
            <span className="node-list__item-name">
              {t("validatorTitleFallback")}
            </span>
            <span
              className="node-list__item-id text-muted"
              title={`${t("id")}: ${id}`}
            >
              {truncateMiddle(id)}
            </span>
          </>
        )}
      </Link>
      <table>
        <tbody>
          <tr>
            <th>{t("Total stake")}</th>
            <td>{formatNumber(stakedOnNode, 2)}</td>
            <td>{stakedTotalPercentage}</td>
          </tr>
          <tr>
            <th>{t("Your stake")}</th>
            <td>{formatNumber(userStake, 2)}</td>
            <td>{userStakePercentage}</td>
          </tr>
        </tbody>
      </table>
    </li>
  );
};

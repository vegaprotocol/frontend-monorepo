import { gql, useQuery } from '@apollo/client';
import { t } from '@vegaprotocol/react-helpers';
import React from 'react';
import { RouteTitle } from '../../components/route-title';
import { SubHeading } from '../../components/sub-heading';
import { SyntaxHighlighter } from '@vegaprotocol/ui-toolkit';
import { DATA_SOURCES } from '../../config';
import useFetch from '../../hooks/use-fetch';
import type { TendermintValidatorsResponse } from './tendermint-validator-response';
import type { NodesQuery } from './__generated__/NodesQuery';

const NODES_QUERY = gql`
  query NodesQuery {
    nodes {
      id
      name
      infoUrl
      avatarUrl
      pubkey
      tmPubkey
      ethereumAdddress
      location
      stakedByOperator
      stakedByDelegates
      stakedTotal
      pendingStake
      epochData {
        total
        offline
        online
      }
      status
      name
    }
  }
`;

const Validators = () => {
  const {
    state: { data: validators },
  } = useFetch<TendermintValidatorsResponse>(
    `${DATA_SOURCES.tendermintUrl}/validators`
  );
  const { data } = useQuery<NodesQuery>(NODES_QUERY);

  return (
    <section>
      <RouteTitle data-testid="validators-header">{t('Validators')}</RouteTitle>
      {data ? (
        <>
          <SubHeading data-testid="vega-header">{t('Vega data')}</SubHeading>
          <SyntaxHighlighter data-testid="vega-data" data={data} />
        </>
      ) : null}
      {validators ? (
        <>
          <SubHeading data-testid="tendermint-header">
            {t('Tendermint data')}
          </SubHeading>
          <SyntaxHighlighter data-testid="tendermint-data" data={validators} />
        </>
      ) : null}
    </section>
  );
};

export default Validators;

import { gql, useQuery } from '@apollo/client';
import React from 'react';
import { DATA_SOURCES } from '../../config';
import useFetch from '../../hooks/use-fetch';
import { TendermintValidatorsResponse } from './tendermint-validator-response';
import { NodesQuery } from '@vegaprotocol/graphql';

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
      <h1>Validators</h1>
      <h2 data-testid="tendermint-header">Tendermint data</h2>
      <pre data-testid="tendermint-data">
        {JSON.stringify(validators, null, '  ')}
      </pre>
      <h2 data-testid="vega-header">Vega data</h2>
      <pre data-testid="vega-data">{JSON.stringify(data, null, '  ')}</pre>
    </section>
  );
};

export default Validators;

import { gql, useQuery } from '@apollo/client';
import React from 'react';
import { DATA_SOURCES } from '../../config';
import useFetch from '../../hooks/use-fetch';
import { TendermintValidatorsResponse } from './tendermint-validator-response';
import { NodesQuery } from './__generated__/NodesQuery';

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
      score
      normalisedScore
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
      <h2>Tendermint data</h2>
      <pre>{JSON.stringify(validators, null, '  ')}</pre>
      <h2>Vega data</h2>
      <pre>{JSON.stringify(data, null, '  ')}</pre>
    </section>
  );
};

export default Validators;

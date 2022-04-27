import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { t, useFetch } from '@vegaprotocol/react-helpers';
import React from 'react';
import { useParams } from 'react-router-dom';
import { RouteTitle } from '../../../components/route-title';
import { SubHeading } from '../../../components/sub-heading';
import { SyntaxHighlighter } from '../../../components/syntax-highlighter';
import { DATA_SOURCES } from '../../../config';
import type { TendermintSearchTransactionResponse } from '../tendermint-transaction-response';
import type {
  PartyAssetsQuery,
  PartyAssetsQueryVariables,
} from './__generated__/PartyAssetsQuery';

const PARTY_ASSETS_QUERY = gql`
  query PartyAssetsQuery($partyId: ID!) {
    party(id: $partyId) {
      id
      delegations {
        amount
        node {
          id
          name
        }
        epoch
      }
      stake {
        currentStakeAvailable
      }
      accounts {
        asset {
          name
          id
          decimals
          symbol
          source {
            __typename
            ... on ERC20 {
              contractAddress
            }
          }
        }
        type
        balance
      }
    }
  }
`;

const Party = () => {
  const { party } = useParams<{ party: string }>();

  const {
    state: { data: partyData },
  } = useFetch<TendermintSearchTransactionResponse>(
    `${
      DATA_SOURCES.tendermintUrl
    }/tx_search?query="tx.submitter='${party?.replace('0x', '')}'"`
  );

  const { data } = useQuery<PartyAssetsQuery, PartyAssetsQueryVariables>(
    PARTY_ASSETS_QUERY,
    {
      // Don't cache data for this query, party information can move quite quickly
      fetchPolicy: 'network-only',
      variables: { partyId: party?.replace('0x', '') || '' },
      skip: !party,
    }
  );

  return (
    <section>
      <RouteTitle data-testid="parties-header">{t('Party')}</RouteTitle>
      {data ? (
        <>
          <SubHeading>{t('Asset data')}</SubHeading>
          <SyntaxHighlighter data={data} />
        </>
      ) : null}

      {partyData ? (
        <>
          <SubHeading>{t('Tendermint Data')}</SubHeading>
          <SyntaxHighlighter data={partyData} />
        </>
      ) : null}
    </section>
  );
};

export { Party };

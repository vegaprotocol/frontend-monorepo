import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import {
  t,
  useFetch,
  addDecimalsFormatNumber,
} from '@vegaprotocol/react-helpers';
import { AccountTypeMapping } from '@vegaprotocol/types';
import React from 'react';
import { useParams } from 'react-router-dom';
import { RouteTitle } from '../../../components/route-title';
import { SubHeading } from '../../../components/sub-heading';
import { SyntaxHighlighter } from '@vegaprotocol/ui-toolkit';
import { Panel } from '../../../components/panel';
import { InfoPanel } from '../../../components/info-panel';
import { toNonHex } from '../../../components/search/detect-search';
import { DATA_SOURCES } from '../../../config';
import type {
  PartyAssetsQuery,
  PartyAssetsQueryVariables,
} from './__generated__/PartyAssetsQuery';
import type { BlockExplorerTransactions } from '../../../routes/types/block-explorer-response';

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
  const partyId = party ? toNonHex(party) : '';

  const {
    state: { data: partyData },
  } = useFetch<BlockExplorerTransactions>(
    `${DATA_SOURCES.blockExplorerUrl}/transactions?limit=1&filters[tx.submitter]=${partyId}`
  );

  const { data } = useQuery<PartyAssetsQuery, PartyAssetsQueryVariables>(
    PARTY_ASSETS_QUERY,
    {
      // Don't cache data for this query, party information can move quite quickly
      fetchPolicy: 'network-only',
      variables: { partyId },
      skip: !party,
    }
  );

  const header = data?.party?.id ? (
    <InfoPanel
      title={t('Address')}
      id={data.party.id}
      type={data.party.__typename}
    />
  ) : (
    <Panel>
      <p>No party found for key {party}</p>
    </Panel>
  );

  const accounts = (
    <section>
      {data?.party?.accounts?.length ? (
        data.party.accounts.map((account) => {
          return (
            <InfoPanel
              title={account.asset.name}
              id={account.asset.id}
              type={`Account Type - ${AccountTypeMapping[account.type]}`}
            >
              <section>
                <dl className="flex gap-2 font-mono">
                  <dt className="font-bold">
                    {t('Balance')} ({account.asset.symbol})
                  </dt>
                  <dd>
                    {addDecimalsFormatNumber(
                      account.balance,
                      account.asset.decimals
                    )}
                  </dd>
                </dl>
              </section>
            </InfoPanel>
          );
        })
      ) : (
        <Panel>
          <p>No Data</p>
        </Panel>
      )}
    </section>
  );

  const staking = (
    <section>
      {data?.party?.stake?.currentStakeAvailable ? (
        <InfoPanel
          title={t('Current Stake Available')}
          id={data?.party?.stake?.currentStakeAvailable}
          type={data?.party?.stake.__typename}
          copy={false}
        />
      ) : (
        <Panel>
          <p>Nothing staked for {party}</p>
        </Panel>
      )}
    </section>
  );

  return (
    <section>
      <RouteTitle data-testid="parties-header">{t('Party')}</RouteTitle>
      {data ? (
        <>
          {header}
          <SubHeading>{t('Asset data')}</SubHeading>
          {accounts}
          <SubHeading>{t('Staking')}</SubHeading>
          {staking}
          <SubHeading>{t('JSON')}</SubHeading>
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

import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import {
  t,
  useFetch,
  addDecimalsFormatNumber,
  useScreenDimensions,
} from '@vegaprotocol/react-helpers';
import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { SubHeading } from '../../../components/sub-heading';
import {
  CopyWithTooltip,
  Icon,
  SyntaxHighlighter,
  AsyncRenderer
} from '@vegaprotocol/ui-toolkit';
import { Panel } from '../../../components/panel';
import { InfoPanel } from '../../../components/info-panel';
import { toNonHex } from '../../../components/search/detect-search';
import { TruncateInline } from '../../../components/truncate/truncate';
import { DATA_SOURCES } from '../../../config';
import type {
  PartyAssetsQuery,
  PartyAssetsQueryVariables,
} from './__generated__/PartyAssetsQuery';
import type { TendermintSearchTransactionResponse } from '../tendermint-transaction-response';
import { useTxsData } from '../../../hooks/use-txs-data';
import { TxsInfiniteList } from '../../../components/txs';

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
  const { isMobile } = useScreenDimensions();
  const visibleChars = useMemo(() => (isMobile ? 10 : 14), [isMobile]);
  const filters = `filters[tx.submitter]=${partyId}`;
  const { hasMoreTxs, loadTxs, error, txsData, loading } = useTxsData({
    limit: 10,
    filters,
  });

  const {
    state: { data: partyData },
  } = useFetch<TendermintSearchTransactionResponse>(
    `${DATA_SOURCES.tendermintUrl}/tx_search?query="tx.submitter='${partyId}'"`
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
    <header className="flex items-center gap-x-4">
      <TruncateInline
        text={data.party.id}
        startChars={visibleChars}
        endChars={visibleChars}
        className="text-4xl xl:text-5xl uppercase font-alpha"
      />
      <CopyWithTooltip text={data.party.id}>
        <button className="bg-zinc-100 dark:bg-zinc-900 rounded-sm py-2 px-3">
          <Icon name="duplicate" className="" />
        </button>
      </CopyWithTooltip>
    </header>
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
            <InfoPanel title={account.asset.name} id={account.asset.id}>
              <section>
                <dl className="flex gap-2">
                  <dt className="text-zinc-500 dark:text-zinc-400 text-md">
                    {t('Balance')} ({account.asset.symbol})
                  </dt>
                  <dd className="text-md">
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
      <h1
        className="font-alpha uppercase font-xl mb-4 text-zinc-800 dark:text-zinc-200"
        data-testid="parties-header"
      >
        {t('Party')}
      </h1>
      {data ? (
        <>
          {header}
          <SubHeading>{t('Asset data')}</SubHeading>
          {accounts}
          <SubHeading>{t('Staking')}</SubHeading>
          {staking}
          <SubHeading>{t('Transactions')}</SubHeading>
          <AsyncRenderer
            loading={loading as boolean}
            error={error}
            data={txsData}
          >
            <TxsInfiniteList
              hasMoreTxs={hasMoreTxs}
              areTxsLoading={loading}
              txs={txsData}
              loadMoreTxs={loadTxs}
              error={error}
              className="mb-28"
            />
          </AsyncRenderer>
          <SubHeading>{t('JSON')}</SubHeading>
          <section data-testid="parties-json">
            <SyntaxHighlighter data={data} />
          </section>
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

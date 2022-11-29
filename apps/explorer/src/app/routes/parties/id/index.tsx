import {
  t,
  useFetch,
  addDecimalsFormatNumber,
  useScreenDimensions,
} from '@vegaprotocol/react-helpers';
import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { SubHeading } from '../../../components/sub-heading';
import { SyntaxHighlighter, AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { Panel } from '../../../components/panel';
import { InfoPanel } from '../../../components/info-panel';
import { toNonHex } from '../../../components/search/detect-search';
import { useTxsData } from '../../../hooks/use-txs-data';
import { TxsInfiniteList } from '../../../components/txs';
import { PageHeader } from '../../../components/page-header';
import { useExplorerPartyAssetsQuery } from './__generated__/party-assets';

const Party = () => {
  const { party } = useParams<{ party: string }>();
  const partyId = toNonHex(party ? party : '');
  const { isMobile } = useScreenDimensions();
  const visibleChars = useMemo(() => (isMobile ? 10 : 14), [isMobile]);
  const filters = `filters[tx.submitter]=${partyId}`;
  const { hasMoreTxs, loadTxs, error, txsData, loading } = useTxsData({
    limit: 100,
    filters,
  });

  const partyRes = useExplorerPartyAssetsQuery({
    // Don't cache data for this query, party information can move quite quickly
    fetchPolicy: 'network-only',
    variables: { partyId: partyId },
    skip: !party,
  });

  const p = partyRes.data?.partiesConnection?.edges[0].node;

  const header = p?.id ? (
    <PageHeader
      title={p.id}
      copy
      truncateStart={visibleChars}
      truncateEnd={visibleChars}
    />
  ) : (
    <Panel>
      <p>No party found for key {party}</p>
    </Panel>
  );

  const accounts = (
    <section>
      {p?.accountsConnection?.edges?.length ? (
        p.accountsConnection?.edges?.map((a) => {
          const account = a?.node;
          if (!account || !account.asset) {
            return '';
          }

          return (
            <InfoPanel title={account.asset.name} id={account.asset.id}>
              <section>
                <dl className="flex gap-2 flex-wrap">
                  <dt className="text-zinc-500 dark:text-zinc-400 text-md">
                    <p>
                      {t('Balance')} ({account.asset.symbol})
                    </p>
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
      {p?.stakingSummary?.currentStakeAvailable ? (
        <InfoPanel
          title={t('Current Stake Available')}
          id={p?.stakingSummary?.currentStakeAvailable}
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
      {partyRes.error ? (
        <PartyIdError id={partyId} error={partyRes.error} />
      ) : null}
      {partyRes.data ? (
        <>
          {header}
          <SubHeading>{t('Asset data')}</SubHeading>
          {accounts}
          <SubHeading>{t('Staking')}</SubHeading>
          {staking}
          <SubHeading>{t('JSON')}</SubHeading>
          <section data-testid="parties-json">
            <SyntaxHighlighter data={data} />
          </section>
          <AsyncRenderer
            loading={loading as boolean}
            error={error}
            data={txsData}
          >
            <SubHeading>{t('Transactions')}</SubHeading>
            <TxsInfiniteList
              hasMoreTxs={hasMoreTxs}
              areTxsLoading={loading}
              txs={txsData}
              loadMoreTxs={loadTxs}
              error={error}
              className="mb-28"
            />
          </AsyncRenderer>
        </>
      ) : null}
    </section>
  );
};

export { Party };

import {
  t,
  addDecimalsFormatNumber,
  useScreenDimensions,
} from '@vegaprotocol/react-helpers';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { SubHeading } from '../../../components/sub-heading';
import { Panel } from '../../../components/panel';
import { InfoPanel } from '../../../components/info-panel';
import { toNonHex } from '../../../components/search/detect-search';
import { useTxsData } from '../../../hooks/use-txs-data';
import { TxsInfiniteList } from '../../../components/txs';
import { PageHeader } from '../../../components/page-header';
import { useExplorerPartyAssetsQuery } from './__generated__/party-assets';
import type { Schema } from '@vegaprotocol/types';
import get from 'lodash/get';

const accountTypeString: Record<Schema.AccountType, string> = {
  ACCOUNT_TYPE_BOND: 'Bond',
  ACCOUNT_TYPE_EXTERNAL: 'External',
  ACCOUNT_TYPE_FEES_INFRASTRUCTURE: 'Fees (Infrastructure)',
  ACCOUNT_TYPE_FEES_LIQUIDITY: 'Fees (Liquidity)',
  ACCOUNT_TYPE_FEES_MAKER: 'Fees (Maker)',
  ACCOUNT_TYPE_GENERAL: 'General',
  ACCOUNT_TYPE_GLOBAL_INSURANCE: 'Global Insurance Pool',
  ACCOUNT_TYPE_GLOBAL_REWARD: 'Global Reward Pool',
  ACCOUNT_TYPE_INSURANCE: 'Insurance',
  ACCOUNT_TYPE_MARGIN: 'Margin',
  ACCOUNT_TYPE_PENDING_TRANSFERS: 'Pending Transfers',
  ACCOUNT_TYPE_REWARD_LP_RECEIVED_FEES: 'Reward - LP Fees received',
  ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES: 'Reward - Maker fees paid',
  ACCOUNT_TYPE_REWARD_MAKER_RECEIVED_FEES: 'Reward - Maker fees received',
  ACCOUNT_TYPE_REWARD_MARKET_PROPOSERS: 'Reward - Market proposers',
  ACCOUNT_TYPE_SETTLEMENT: 'Settlement',
};

const Party = () => {
  const { party } = useParams<{ party: string }>();
  const partyId = toNonHex(party ? party : '');
  const { isMobile } = useScreenDimensions();
  const visibleChars = useMemo(() => (isMobile ? 10 : 14), [isMobile]);
  const filters = `filters[tx.submitter]=${partyId}`;
  const { hasMoreTxs, loadTxs, error, txsData, loading } = useTxsData({
    limit: 10,
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
          const m = get(account, 'market.tradableInstrument.instrument.name');

          return (
            <InfoPanel
              title={account.asset.name}
              id={`${accountTypeString[account.type]} ${m ? ` - ${m}` : ''}`}
            >
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

          <SubHeading>{t('Transactions')}</SubHeading>
          <TxsInfiniteList
            hasMoreTxs={hasMoreTxs}
            areTxsLoading={loading}
            txs={txsData}
            loadMoreTxs={loadTxs}
            error={error}
            className="mb-28"
          />
        </>
      ) : null}
    </section>
  );
};

export { Party };

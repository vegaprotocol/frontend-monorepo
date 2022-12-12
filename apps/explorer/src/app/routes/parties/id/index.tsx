import { t, useScreenDimensions } from '@vegaprotocol/react-helpers';
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
import type * as Schema from '@vegaprotocol/types';
import get from 'lodash/get';
import { useDocumentTitle } from '../../../hooks/use-document-title';
import AssetBalance from '../../../components/asset-balance/asset-balance';
import { AssetLink, MarketLink } from '../../../components/links';
import { Table, TableRow } from '../../../components/table';

const accountTypeString: Record<Schema.AccountType, string> = {
  ACCOUNT_TYPE_BOND: t('Bond'),
  ACCOUNT_TYPE_EXTERNAL: t('External'),
  ACCOUNT_TYPE_FEES_INFRASTRUCTURE: t('Fees (Infrastructure)'),
  ACCOUNT_TYPE_FEES_LIQUIDITY: t('Fees (Liquidity)'),
  ACCOUNT_TYPE_FEES_MAKER: t('Fees (Maker)'),
  ACCOUNT_TYPE_GENERAL: t('General'),
  ACCOUNT_TYPE_GLOBAL_INSURANCE: t('Global Insurance Pool'),
  ACCOUNT_TYPE_GLOBAL_REWARD: t('Global Reward Pool'),
  ACCOUNT_TYPE_INSURANCE: t('Insurance'),
  ACCOUNT_TYPE_MARGIN: t('Margin'),
  ACCOUNT_TYPE_PENDING_TRANSFERS: t('Pending Transfers'),
  ACCOUNT_TYPE_REWARD_LP_RECEIVED_FEES: t('Reward - LP Fees received'),
  ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES: t('Reward - Maker fees paid'),
  ACCOUNT_TYPE_REWARD_MAKER_RECEIVED_FEES: t('Reward - Maker fees received'),
  ACCOUNT_TYPE_REWARD_MARKET_PROPOSERS: t('Reward - Market proposers'),
  ACCOUNT_TYPE_SETTLEMENT: t('Settlement'),
};

const Party = () => {
  const { party } = useParams<{ party: string }>();

  useDocumentTitle(['Parties', party || '-']);
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
    <Table>
      <thead>
        <TableRow modifier="bordered" className="font-mono">
          <td>{t('Account type')}</td>
          <td>{t('Market')}</td>
          <td className="text-right pr-2">{t('Balance')}</td>
          <td>{t('Asset')}</td>
        </TableRow>
      </thead>
      <tbody>
        {p?.accountsConnection?.edges?.map((a) => {
          const account = a?.node;
          if (!account || !account.asset) {
            return '';
          }
          const m = get(account, 'market.tradableInstrument.instrument.name');

          return (
            <TableRow
              title={account.asset.name}
              id={`${accountTypeString[account.type]} ${m ? ` - ${m}` : ''}`}
            >
              <td className="text-md">{accountTypeString[account.type]}</td>
              <td className="text-md">
                {account?.market?.id ? (
                  <MarketLink id={account.market?.id} />
                ) : (
                  '-'
                )}
              </td>
              <td className="text-md text-right pr-2">
                <AssetBalance
                  assetId={account.asset.id}
                  price={account.balance}
                  hideAssetLink={true}
                />
              </td>
              <td className="text-md">
                <AssetLink id={account.asset.id} />
              </td>
            </TableRow>
          );
        })}
      </tbody>
    </Table>
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

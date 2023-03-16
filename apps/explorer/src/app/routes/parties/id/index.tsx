import { getNodes } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { useScreenDimensions } from '@vegaprotocol/react-helpers';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { SubHeading } from '../../../components/sub-heading';
import { Panel } from '../../../components/panel';
import { toNonHex } from '../../../components/search/detect-search';
import { useTxsData } from '../../../hooks/use-txs-data';
import { TxsInfiniteList } from '../../../components/txs';
import { PageHeader } from '../../../components/page-header';
import { useExplorerPartyAssetsQuery } from './__generated__/Party-assets';
import { useDocumentTitle } from '../../../hooks/use-document-title';
import GovernanceAssetBalance from '../../../components/asset-balance/governance-asset-balance';
import { PartyAccounts } from './components/party-accounts';

const Party = () => {
  const { party } = useParams<{ party: string }>();

  useDocumentTitle(['Public keys', party || '-']);
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

  return (
    <section>
      <h1
        className="font-alpha calt uppercase font-xl mb-4 text-vega-dark-100 dark:text-vega-light-100"
        data-testid="parties-header"
      >
        {t('Public key')}
      </h1>
      <PageHeader
        title={partyId}
        copy
        truncateStart={visibleChars}
        truncateEnd={visibleChars}
      />

      {/*<PartyAccounts partyId={partyId} /> */}

      <div className="grid md:grid-flow-col grid-flow-row md:space-x-4 grid-cols-1 md:grid-cols-3 w-full">
        <div className="border-2 border-solid border-vega-light-100 dark:border-vega-dark-200 p-5 mt-5">
          {p?.stakingSummary.currentStakeAvailable ? (
            <>
              <strong className="font-semibold">
                {t('Staking Balance: ')}
              </strong>
              <GovernanceAssetBalance
                price={p.stakingSummary.currentStakeAvailable}
              />
            </>
          ) : null}
        </div>
      </div>

      <SubHeading>{t('Transactions')}</SubHeading>
      <TxsInfiniteList
        hasMoreTxs={hasMoreTxs}
        areTxsLoading={loading}
        txs={txsData}
        loadMoreTxs={loadTxs}
        error={error}
        className="mb-28"
      />
    </section>
  );
};

export { Party };

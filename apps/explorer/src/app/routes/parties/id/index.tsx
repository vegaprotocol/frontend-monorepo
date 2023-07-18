import { t } from '@vegaprotocol/i18n';
import { useScreenDimensions } from '@vegaprotocol/react-helpers';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SubHeading } from '../../../components/sub-heading';
import { toNonHex } from '../../../components/search/detect-search';
import { useTxsData } from '../../../hooks/use-txs-data';
import { TxsInfiniteList } from '../../../components/txs';
import { PageHeader } from '../../../components/page-header';
import { useDocumentTitle } from '../../../hooks/use-document-title';
import { Icon, Intent, Notification, Splash } from '@vegaprotocol/ui-toolkit';
import { aggregatedAccountsDataProvider } from '@vegaprotocol/accounts';
import { PartyBlockStake } from './components/party-block-stake';
import { PartyBlockAccounts } from './components/party-block-accounts';
import { isValidPartyId } from './components/party-id-error';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { TxsListNavigation } from '../../../components/txs/tx-list-navigation';
import { AllFilterOptions, TxsFilter } from '../../../components/txs/tx-filter';

const Party = () => {
  const [filters, setFilters] = useState(new Set(AllFilterOptions));
  const { party } = useParams<{ party: string }>();

  useDocumentTitle(['Public keys', party || '-']);
  const navigate = useNavigate();

  const partyId = toNonHex(party ? party : '');
  const { isMobile } = useScreenDimensions();
  const visibleChars = useMemo(() => (isMobile ? 10 : 14), [isMobile]);
  const baseFilters = `filters[tx.submitter]=${partyId}`;
  const f =
    filters && filters.size === 1
      ? `${baseFilters}&filters[cmd.type]=${Array.from(filters)[0]}`
      : baseFilters;

  const {
    hasMoreTxs,
    nextPage,
    previousPage,
    error,
    refreshTxs,
    loading,
    txsData,
    hasPreviousPage,
  } = useTxsData({
    limit: 25,
    filters: f,
  });

  const variables = useMemo(() => ({ partyId }), [partyId]);
  const {
    data: AccountData,
    loading: AccountLoading,
    error: AccountError,
  } = useDataProvider({
    dataProvider: aggregatedAccountsDataProvider,
    variables,
  });

  if (!isValidPartyId(partyId)) {
    return (
      <div className="max-w-sm mx-auto">
        <Notification
          message={t('Invalid party ID')}
          intent={Intent.Danger}
          buttonProps={{
            text: t('Go back'),
            action: () => navigate(-1),
            className: 'py-1',
            size: 'small',
          }}
        />
      </div>
    );
  }

  return (
    <section>
      <PageHeader
        title={partyId}
        copy
        truncateStart={visibleChars}
        truncateEnd={visibleChars}
      />

      <div className="grid md:grid-flow-col grid-flow-row md:space-x-4 grid-cols-1 md:grid-cols-2 w-full">
        <PartyBlockAccounts
          accountError={AccountError}
          accountLoading={AccountLoading}
          accountData={AccountData}
          partyId={partyId}
        />
        <PartyBlockStake
          accountError={AccountError}
          accountLoading={AccountLoading}
          partyId={partyId}
        />
      </div>

      <SubHeading>{t('Transactions')}</SubHeading>
      <TxsListNavigation
        refreshTxs={refreshTxs}
        nextPage={nextPage}
        previousPage={previousPage}
        hasPreviousPage={hasPreviousPage}
        loading={loading}
        hasMoreTxs={hasMoreTxs}
      >
        <TxsFilter filters={filters} setFilters={setFilters} />
      </TxsListNavigation>
      {!error && txsData ? (
        <TxsInfiniteList
          hasMoreTxs={hasMoreTxs}
          areTxsLoading={loading}
          txs={txsData}
          loadMoreTxs={nextPage}
          error={error}
          className="mb-28 w-full"
        />
      ) : (
        <Splash>
          <Icon name="error" className="mr-1" />
          &nbsp;{t('Could not load transaction list for party')}
        </Splash>
      )}
    </section>
  );
};

export { Party };

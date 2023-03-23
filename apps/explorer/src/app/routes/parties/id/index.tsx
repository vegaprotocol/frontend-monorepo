import { t } from '@vegaprotocol/i18n';
import {
  useDataProvider,
  useScreenDimensions,
} from '@vegaprotocol/react-helpers';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { SubHeading } from '../../../components/sub-heading';
import { toNonHex } from '../../../components/search/detect-search';
import { useTxsData } from '../../../hooks/use-txs-data';
import { TxsInfiniteList } from '../../../components/txs';
import { PageHeader } from '../../../components/page-header';
import { useExplorerPartyAssetsQuery } from './__generated__/Party-assets';
import { useDocumentTitle } from '../../../hooks/use-document-title';
import GovernanceAssetBalance from '../../../components/asset-balance/governance-asset-balance';
import {
  Icon,
  KeyValueTable,
  KeyValueTableRow,
  Loader,
  Splash,
} from '@vegaprotocol/ui-toolkit';
import { PartyBlock } from './components/party-block';
import { aggregatedAccountsDataProvider } from '@vegaprotocol/accounts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@vegaprotocol/ui-toolkit';
import { addDecimalsFixedFormatNumber } from '@vegaprotocol/utils';

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

  const variables = useMemo(() => ({ partyId }), [partyId]);
  const {
    data: AccountData,
    loading: AccountLoading,
    error: AccountError,
  } = useDataProvider({
    dataProvider: aggregatedAccountsDataProvider,
    variables,
  });

  const partyRes = useExplorerPartyAssetsQuery({
    // Don't cache data for this query, party information can move quite quickly
    fetchPolicy: 'network-only',
    variables: { partyId: partyId },
    skip: !party,
  });

  const p = partyRes.data?.partiesConnection?.edges[0].node;

  return (
    <section className="max-w-5xl mx-auto">
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

      <div className="grid md:grid-flow-col grid-flow-row md:space-x-4 grid-cols-1 md:grid-cols-3 w-full">
        <PartyBlock title={t('Accounts')}>
          {AccountData ? (
            <KeyValueTable>
              <KeyValueTableRow noBorder={true}>
                <div>{t('Assets')}</div>
                <DropdownMenu
                  trigger={
                    <DropdownMenuTrigger>
                      <span>{AccountData.length} assets held</span>
                    </DropdownMenuTrigger>
                  }
                >
                  <DropdownMenuContent>
                    {AccountData.map((asset) => (
                      <DropdownMenuItem key={asset.asset.name}>
                        <div>
                          <strong className="block w-2 bold">
                            {asset.asset.name}
                          </strong>
                          <span className="font-mono">
                            {addDecimalsFixedFormatNumber(
                              asset.total,
                              asset.asset.decimals
                            )}
                          </span>
                          <span className="ml-1">{asset.asset.symbol}</span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </KeyValueTableRow>
            </KeyValueTable>
          ) : AccountLoading && !AccountError ? (
            <Loader size="small" />
          ) : (
            <p>
              <Icon className="mr-1" name="error" />
              <span className="text-sm">{t('Could not load assets')}</span>
            </p>
          )}
        </PartyBlock>

        <PartyBlock title={t('Staking')}>
          {p?.stakingSummary.currentStakeAvailable ? (
            <KeyValueTable>
              <KeyValueTableRow noBorder={true}>
                <div>{t('Available stake')}</div>
                <div>
                  <GovernanceAssetBalance
                    price={p.stakingSummary.currentStakeAvailable}
                  />
                </div>
              </KeyValueTableRow>
            </KeyValueTable>
          ) : AccountLoading && !AccountError ? (
            <Loader size="small" />
          ) : (
            <p>
              <Icon className="mr-1" name="error" />
              <span className="text-sm">
                {t('Could not load stake details')}
              </span>
            </p>
          )}
        </PartyBlock>
      </div>

      <SubHeading>{t('Transactions')}</SubHeading>
      {!error ? (
        <TxsInfiniteList
          hasMoreTxs={hasMoreTxs}
          areTxsLoading={loading}
          txs={txsData}
          loadMoreTxs={loadTxs}
          error={error}
          className="mb-28"
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

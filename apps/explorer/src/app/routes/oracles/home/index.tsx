import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { RouteTitle } from '../../../components/route-title';
import { t } from '@vegaprotocol/i18n';
import { useDocumentTitle } from '../../../hooks/use-document-title';
import { useScrollToLocation } from '../../../hooks/scroll-to-location';
import { useExplorerOracleFormMarketsQuery } from '../__generated__/OraclesForMarkets';
import { OraclesTable } from '../../../components/oracle-table';

const Oracles = () => {
  const { data, loading, error } = useExplorerOracleFormMarketsQuery({
    errorPolicy: 'ignore',
  });

  useDocumentTitle(['Oracles']);
  useScrollToLocation();

  return (
    <section>
      <RouteTitle data-testid="oracle-specs-heading">{t('Oracles')}</RouteTitle>
      <AsyncRenderer
        data={data}
        loading={loading}
        error={error}
        loadingMessage={t('Loading oracle data...')}
        errorMessage={t('Oracle data could not be loaded')}
        noDataMessage={t('No oracles found')}
        noDataCondition={(data) =>
          !data?.oracleSpecsConnection?.edges ||
          data.oracleSpecsConnection.edges?.length === 0
        }
      >
        <OraclesTable data={data} />
      </AsyncRenderer>
    </section>
  );
};

export default Oracles;

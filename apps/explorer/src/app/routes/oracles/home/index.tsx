import { AsyncRenderer, SyntaxHighlighter } from '@vegaprotocol/ui-toolkit';
import { RouteTitle } from '../../../components/route-title';
import { t } from '@vegaprotocol/i18n';
import { useExplorerOracleSpecsQuery } from '../__generated__/Oracles';
import { useDocumentTitle } from '../../../hooks/use-document-title';
import { OracleDetails } from '../components/oracle';
import { useScrollToLocation } from '../../../hooks/scroll-to-location';
import filter from 'recursive-key-filter';

const Oracles = () => {
  const { data, loading, error } = useExplorerOracleSpecsQuery();

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
        {data?.oracleSpecsConnection?.edges
          ? data.oracleSpecsConnection.edges.map((o) => {
              const id = o?.node.dataSourceSpec.spec.id;
              if (!id) {
                return null;
              }
              return (
                <div id={id} key={id} className="mb-10">
                  <OracleDetails
                    id={id}
                    dataSource={o?.node}
                    showBroadcasts={false}
                  />
                  <details>
                    <summary className="pointer">JSON</summary>
                    <SyntaxHighlighter data={filter(o, ['__typename'])} />
                  </details>
                </div>
              );
            })
          : null}
      </AsyncRenderer>
    </section>
  );
};

export default Oracles;

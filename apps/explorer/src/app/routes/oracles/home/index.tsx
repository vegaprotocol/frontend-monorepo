import { Loader, SyntaxHighlighter } from '@vegaprotocol/ui-toolkit';
import { RouteTitle } from '../../../components/route-title';
import { t } from '@vegaprotocol/react-helpers';
import { useExplorerOracleSpecsQuery } from '../__generated__/Oracles';
import { useDocumentTitle } from '../../../hooks/use-document-title';
import { OracleDetails } from '../components/oracle';
import { useScrollToLocation } from '../../../hooks/scroll-to-location';
import filter from 'recursive-key-filter';

const Oracles = () => {
  const { data, loading } = useExplorerOracleSpecsQuery();

  useDocumentTitle(['Oracles']);
  useScrollToLocation();

  return (
    <section>
      <RouteTitle data-testid="oracle-specs-heading">{t('Oracles')}</RouteTitle>
      {loading ? <Loader /> : null}
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
    </section>
  );
};

export default Oracles;

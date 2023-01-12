import { useLocation } from 'react-router-dom';

import React, { useEffect } from 'react';
import { SyntaxHighlighter } from '@vegaprotocol/ui-toolkit';
import { RouteTitle } from '../../components/route-title';
import { t } from '@vegaprotocol/react-helpers';
import { SubHeading } from '../../components/sub-heading';
import { useExplorerOracleSpecsQuery } from './__generated__/Oracles';
import { useDocumentTitle } from '../../hooks/use-document-title';
import { OracleDetails } from './components/oracle';

const Oracles = () => {
  const { hash } = useLocation();
  const { data, loading } = useExplorerOracleSpecsQuery();

  useDocumentTitle(['Oracles']);

  useEffect(() => {
    if (data && !loading && hash) {
      const element = document.getElementById(hash.substring(1));
      if (element) {
        window.scrollTo({
          top: element.offsetTop,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash, loading, !!data]);

  return (
    <section>
      <RouteTitle data-testid="oracle-specs-heading">{t('Oracles')}</RouteTitle>
      {data?.oracleSpecsConnection?.edges
        ? data.oracleSpecsConnection.edges.map((o) => {
            const id = o?.node.dataSourceSpec.spec.id;
            if (!id) {
              return null;
            }
            return (
              <div key={id} className="mb-10 cursor-pointer">
                <OracleDetails
                  id={id}
                  dataSource={o?.node}
                  dataConnection={o?.node}
                />
                <details>
                  <summary className="pointer">JSON</summary>
                  <SyntaxHighlighter data={o} />
                </details>
              </div>
            );
          })
        : null}
    </section>
  );
};

export default Oracles;

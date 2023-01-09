import { useLocation } from 'react-router-dom';

import React, { useEffect } from 'react';
import { SyntaxHighlighter } from '@vegaprotocol/ui-toolkit';
import { RouteTitle } from '../../components/route-title';
import { t } from '@vegaprotocol/react-helpers';
import { SubHeading } from '../../components/sub-heading';
import { useOracleSpecsQuery } from './__generated__/Oracles';

const Oracles = () => {
  const { hash } = useLocation();
  const { data, loading } = useOracleSpecsQuery();

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
              <React.Fragment key={id}>
                <SubHeading id={id.toString()}>{id}</SubHeading>
                <SyntaxHighlighter data={o} />
              </React.Fragment>
            );
          })
        : null}
    </section>
  );
};

export default Oracles;

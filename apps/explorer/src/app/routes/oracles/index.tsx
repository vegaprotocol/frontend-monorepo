import { gql, useQuery } from '@apollo/client';
import type { OracleSpecs as OracleSpecsQuery } from './__generated__/OracleSpecs';

import React from 'react';
import { SyntaxHighlighter } from '@vegaprotocol/ui-toolkit';
import { RouteTitle } from '../../components/route-title';
import { t } from '@vegaprotocol/react-helpers';
import { SubHeading } from '../../components/sub-heading';

const ORACLE_SPECS_QUERY = gql`
  query OracleSpecs {
    oracleSpecs {
      status
      id
      createdAt
      updatedAt
      pubKeys
      filters {
        key {
          name
          type
        }
        conditions {
          value
          operator
        }
      }
      data {
        pubKeys
      }
    }
  }
`;

const Oracles = () => {
  const { data } = useQuery<OracleSpecsQuery>(ORACLE_SPECS_QUERY);

  return (
    <section>
      <RouteTitle data-testid="oracle-specs-heading">{t('Oracles')}</RouteTitle>
      {data?.oracleSpecs
        ? data.oracleSpecs.map((o) => (
            <React.Fragment key={o.id}>
              <SubHeading>{o.id}</SubHeading>
              <SyntaxHighlighter data={o} />
            </React.Fragment>
          ))
        : null}
    </section>
  );
};

export default Oracles;

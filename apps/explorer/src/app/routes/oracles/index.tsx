import { gql, useQuery } from '@apollo/client';
import type { Oracles as OraclesQuery } from './__generated__/Oracles';

import React from 'react';
import { SyntaxHighlighter } from '@vegaprotocol/ui-toolkit';
import { RouteTitle } from '../../components/route-title';
import { t } from '@vegaprotocol/react-helpers';
import { SubHeading } from '../../components/sub-heading';
import { getProposalName } from '../governance';

const ORACLES_QUERY = gql`
  query Oracles {
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
  const { data } = useQuery<OraclesQuery>(ORACLES_QUERY);

  return (
    <section>
      <RouteTitle data-testid="oracles-heading">{t('Oracles')}</RouteTitle>
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

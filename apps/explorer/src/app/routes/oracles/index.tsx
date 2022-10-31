import { gql, useQuery } from '@apollo/client';
import { useLocation } from 'react-router-dom';
import type { OracleSpecs as OracleSpecsQuery } from './__generated__/OracleSpecs';

import React, { useEffect } from 'react';
import { SyntaxHighlighter } from '@vegaprotocol/ui-toolkit';
import { RouteTitle } from '../../components/route-title';
import { t } from '@vegaprotocol/react-helpers';
import { SubHeading } from '../../components/sub-heading';

const ORACLE_SPECS_QUERY = gql`
  query OracleSpecs {
    oracleSpecs {
      dataSourceSpec {
        spec {
          id
          createdAt
          updatedAt
          status
          config {
            signers {
              signer {
                ... on ETHAddress {
                  address
                }
                ... on PubKey {
                  key
                }
              }
            }
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
          }
        }
      }
      dataConnection {
        edges {
          node {
            externalData {
              data {
                signers {
                  signer {
                    ... on ETHAddress {
                      address
                    }
                    ... on PubKey {
                      key
                    }
                  }
                }
                data {
                  name
                  value
                }
                matchedSpecIds
              }
            }
          }
        }
      }
    }
  }
`;

const Oracles = () => {
  const { hash } = useLocation();
  const { data, loading } = useQuery<OracleSpecsQuery>(ORACLE_SPECS_QUERY);

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
      {data?.oracleSpecs
        ? data.oracleSpecs.map((o) => {
            const id = o.dataSourceSpec.spec.id;
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

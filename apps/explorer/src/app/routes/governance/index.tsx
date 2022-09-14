import { gql, useQuery } from '@apollo/client';
import { t, getNodes } from '@vegaprotocol/react-helpers';
import React from 'react';
import { RouteTitle } from '../../components/route-title';
import { SubHeading } from '../../components/sub-heading';
import { SyntaxHighlighter } from '@vegaprotocol/ui-toolkit';
import type {
  ProposalsQuery,
  ProposalsQuery_proposalsConnection_edges_node,
} from './__generated__/ProposalsQuery';

const PROPOSALS_QUERY = gql`
  query ProposalsQuery {
    proposalsConnection {
      edges {
        node {
          id
          rationale {
            title
            description
          }
          reference
          state
          datetime
          rejectionReason
          party {
            id
          }
          terms {
            closingDatetime
            enactmentDatetime
            change {
              ... on NewMarket {
                instrument {
                  name
                }
              }
              ... on UpdateMarket {
                marketId
              }
              ... on NewAsset {
                __typename
                symbol
                source {
                  ... on BuiltinAsset {
                    maxFaucetAmountMint
                  }
                  ... on ERC20 {
                    contractAddress
                  }
                }
              }
              ... on UpdateNetworkParameter {
                networkParameter {
                  key
                  value
                }
              }
            }
          }
          votes {
            yes {
              totalTokens
              totalNumber
              votes {
                value
                party {
                  id
                  stakingSummary {
                    currentStakeAvailable
                  }
                }
                datetime
              }
            }
            no {
              totalTokens
              totalNumber
              votes {
                value
                party {
                  id
                  stakingSummary {
                    currentStakeAvailable
                  }
                }
                datetime
              }
            }
          }
        }
      }
    }
  }
`;

const Governance = () => {
  const { data } = useQuery<ProposalsQuery>(PROPOSALS_QUERY, {
    errorPolicy: 'ignore',
  });
  const proposals = getNodes<ProposalsQuery_proposalsConnection_edges_node>(data?.proposalsConnection);

  if (!data) return null;
  return (
    <section>
      <RouteTitle data-testid="governance-header">
        {t('Governance Proposals')}
      </RouteTitle>
      {proposals.map((p) => (
        <React.Fragment key={p.id}>
          <SubHeading>
            {p.rationale.title || p.rationale.description}
          </SubHeading>
          <SyntaxHighlighter data={p} />
        </React.Fragment>
      ))}
    </section>
  );
};

export default Governance;

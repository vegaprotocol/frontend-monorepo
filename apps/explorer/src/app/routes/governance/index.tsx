import { gql, useQuery } from '@apollo/client';
import React from 'react';
import { RouteTitle } from '../../components/route-title';
import { SubHeading } from '../../components/sub-heading';
import { SyntaxHighlighter } from '../../components/syntax-highlighter';
import type {
  ProposalsQuery,
  ProposalsQuery_proposals_terms_change,
} from './__generated__/ProposalsQuery';

export function getProposalName(change: ProposalsQuery_proposals_terms_change) {
  if (change.__typename === 'NewAsset') {
    return `New asset: ${change.symbol}`;
  } else if (change.__typename === 'NewMarket') {
    return `New market: ${change.instrument.name}`;
  } else if (change.__typename === 'UpdateMarket') {
    return `Update market: ${change.marketId}`;
  } else if (change.__typename === 'UpdateNetworkParameter') {
    return `Update network: ${change.networkParameter.key}`;
  }

  return 'Unknown proposal';
}

const PROPOSAL_QUERY = gql`
  query ProposalsQuery {
    proposals {
      id
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
              stake {
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
              stake {
                currentStakeAvailable
              }
            }
            datetime
          }
        }
      }
    }
  }
`;

const Governance = () => {
  const { data } = useQuery<ProposalsQuery>(PROPOSAL_QUERY);

  if (!data) return null;
  return (
    <section>
      <RouteTitle data-testid="governance-header">Governance</RouteTitle>
      {data.proposals?.map((p) => (
        <React.Fragment key={p.id}>
          <SubHeading>{getProposalName(p.terms.change)}</SubHeading>
          <SyntaxHighlighter data={p} />
        </React.Fragment>
      ))}
    </section>
  );
};

export default Governance;

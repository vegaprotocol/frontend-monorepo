import { gql, useQuery } from '@apollo/client';
import React from 'react';
import { SyntaxHighlighter } from '../../components/syntax-highlighter';
import {
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

  if (!data || !data.proposals) return null;
  return (
    <section>
      <h1>Governance</h1>
      {data.proposals.map((p) => (
        <React.Fragment key={p.id}>
          {/* TODO get proposal name generator from console */}
          <h2>{getProposalName(p.terms.change)}</h2>
          <SyntaxHighlighter data={p} />
        </React.Fragment>
      ))}
    </section>
  );
};

export default Governance;

import { gql, useQuery } from '@apollo/client';
import React from 'react';
import { SyntaxHighlighter } from '../../components/syntax-highlighter';
import { ProposalsQuery } from './__generated__/ProposalsQuery';

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
          <h2>{p.id}</h2>
          <SyntaxHighlighter data={p} />
        </React.Fragment>
      ))}
    </section>
  );
};

export default Governance;

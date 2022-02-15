import { gql, useQuery } from "@apollo/client";
import { ProposalsQuery } from "./__generated__/ProposalsQuery";

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
  return (
    <section>
      <h1>Governance</h1>
      <pre>{JSON.stringify(data, null, "  ")}</pre>
    </section>
  );
};

export default Governance;

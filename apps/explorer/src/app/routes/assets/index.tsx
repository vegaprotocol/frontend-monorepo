import { gql, useQuery } from "@apollo/client";
import { AssetsQuery } from "./__generated__/AssetsQuery";

export const ASSETS_QUERY = gql`
  query AssetsQuery {
    assets {
      id
      name
      symbol
      totalSupply
      decimals
      minLpStake
      source {
        ... on ERC20 {
          contractAddress
        }
        ... on BuiltinAsset {
          maxFaucetAmountMint
        }
      }
      infrastructureFeeAccount {
        type
        balance
        market {
          id
        }
      }
    }
  }
`;

const Assets = () => {
  const { data } = useQuery<AssetsQuery>(ASSETS_QUERY);
  return (
    <section>
      <h1>Assets</h1>
      <pre>{JSON.stringify(data, null, "  ")}</pre>
    </section>
  );
};

export default Assets;

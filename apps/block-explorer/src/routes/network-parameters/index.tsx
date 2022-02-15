import { gql, useQuery } from "@apollo/client";
import { NetworkParametersQuery } from "./__generated__/NetworkParametersQuery";

export const NETWORK_PARAMETERS_QUERY = gql`
  query NetworkParametersQuery {
    networkParameters {
      key
      value
    }
  }
`;

const NetworkParameters = () => {
  const { data } = useQuery<NetworkParametersQuery>(NETWORK_PARAMETERS_QUERY);
  return (
    <section>
      <h1>NetworkParameters</h1>
      <pre>{JSON.stringify(data, null, "  ")}</pre>
    </section>
  );
};

export default NetworkParameters;

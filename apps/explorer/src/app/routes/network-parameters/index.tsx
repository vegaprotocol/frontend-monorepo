import { gql, useQuery } from '@apollo/client';
import { NetworkParametersQuery } from '@vegaprotocol/graphql';

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
      <h1 data-testid="network-param-header">NetworkParameters</h1>
      <pre data-testid="parameters">{JSON.stringify(data, null, '  ')}</pre>
    </section>
  );
};

export default NetworkParameters;

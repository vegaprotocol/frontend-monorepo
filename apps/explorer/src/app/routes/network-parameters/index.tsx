import { gql, useQuery } from '@apollo/client';
import { RouteTitle } from '../../components/route-title';
import type { NetworkParametersQuery } from './__generated__/NetworkParametersQuery';
import { SyntaxHighlighter } from '../../components/syntax-highlighter';

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
      <RouteTitle data-testid="network-param-header">
        Network Parameters
      </RouteTitle>
      {data ? <SyntaxHighlighter data={data} /> : null}
    </section>
  );
};

export default NetworkParameters;

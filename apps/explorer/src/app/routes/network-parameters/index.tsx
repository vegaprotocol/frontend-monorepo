import { gql, useQuery } from '@apollo/client';
import { KeyValueTable, KeyValueTableRow } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/react-helpers';
import { RouteTitle } from '../../components/route-title';
import type {
  NetworkParametersQuery,
  NetworkParametersQuery_networkParameters,
} from './__generated__/NetworkParametersQuery';

export const renderRow = (row: NetworkParametersQuery_networkParameters) => {
  return (
    <KeyValueTable>
      <KeyValueTableRow>
        {row.key}
        {row.value}
      </KeyValueTableRow>
    </KeyValueTable>
  );
};

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
        {t('Network Parameters')}
      </RouteTitle>
      {data
        ? (data.networkParameters || []).map((row) => renderRow(row))
        : null}
    </section>
  );
};

export default NetworkParameters;

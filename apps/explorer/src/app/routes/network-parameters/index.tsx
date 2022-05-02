import { gql, useQuery } from '@apollo/client';
import {
  KeyValueTable,
  KeyValueTableRow,
  SyntaxHighlighter,
} from '@vegaprotocol/ui-toolkit';
import { formatNumber, t } from '@vegaprotocol/react-helpers';
import { RouteTitle } from '../../components/route-title';
import type {
  NetworkParametersQuery,
  NetworkParametersQuery_networkParameters,
} from './__generated__/NetworkParametersQuery';

export const renderRow = (row: NetworkParametersQuery_networkParameters) => {
  const isSyntaxRow =
    isJsonString(row.value) && Object.keys(JSON.parse(row.value)).length > 0;
  return (
    <KeyValueTableRow key={row.key} inline={!isSyntaxRow}>
      {row.key}
      {isSyntaxRow ? (
        <SyntaxHighlighter data={JSON.parse(row.value)} />
      ) : isNaN(Number(row.value)) ? (
        row.value
      ) : (
        formatNumber(Number(row.value), 4)
      )}
    </KeyValueTableRow>
  );
};

export const isJsonString = (str: string) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
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
  if (!data || !data.networkParameters) return null;
  return (
    <section>
      <RouteTitle data-testid="network-param-header">
        {t('Network Parameters')}
      </RouteTitle>
      <KeyValueTable>
        {(data.networkParameters || []).map((row) => renderRow(row))}
      </KeyValueTable>
    </section>
  );
};

export default NetworkParameters;

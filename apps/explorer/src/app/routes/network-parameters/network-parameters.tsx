import { gql, useQuery } from '@apollo/client';
import {
  AsyncRenderer,
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
import orderBy from 'lodash/orderBy';

export const renderRow = (row: NetworkParametersQuery_networkParameters) => {
  const isSyntaxRow = isJsonObject(row.value);
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

export const isJsonObject = (str: string) => {
  try {
    return JSON.parse(str) && Object.keys(JSON.parse(str)).length > 0;
  } catch (e) {
    return false;
  }
};

export const NETWORK_PARAMETERS_QUERY = gql`
  query NetworkParametersQuery {
    networkParameters {
      key
      value
    }
  }
`;

export interface NetworkParametersTableProps
  extends React.HTMLAttributes<HTMLTableElement> {
  data?: NetworkParametersQuery;
}

export const NetworkParametersTable = ({
  data,
}: NetworkParametersTableProps) => (
  <section>
    <RouteTitle data-testid="network-param-header">
      {t('Network Parameters')}
    </RouteTitle>
    <KeyValueTable data-testid="parameters">
      {(data?.networkParameters || []).map((row) => renderRow(row))}
    </KeyValueTable>
  </section>
);

export const NetworkParameters = () => {
  const { data, loading, error } = useQuery<NetworkParametersQuery>(
    NETWORK_PARAMETERS_QUERY
  );
  return (
    <AsyncRenderer
      data={data}
      loading={loading}
      error={error}
      render={(data) => {
        const ascParams = orderBy(
          data.networkParameters || [],
          (param) => param.key,
          'asc'
        );
        return (
          <NetworkParametersTable data={{ networkParameters: ascParams }} />
        );
      }}
    />
  );
};

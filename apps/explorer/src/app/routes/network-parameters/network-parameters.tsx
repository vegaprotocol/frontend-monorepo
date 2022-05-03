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
  const { data } = useQuery<NetworkParametersQuery>(NETWORK_PARAMETERS_QUERY);
  if (!data || !data.networkParameters) return null;
  return <NetworkParametersTable data={data} />;
};

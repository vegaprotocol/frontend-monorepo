import { gql, useQuery } from '@apollo/client';
import {
  AsyncRenderer,
  KeyValueTable,
  KeyValueTableRow,
  SyntaxHighlighter,
} from '@vegaprotocol/ui-toolkit';
import {
  addDecimalsFormatNumber,
  formatNumber,
  t,
} from '@vegaprotocol/react-helpers';
import { RouteTitle } from '../../components/route-title';
import type {
  NetworkParametersQuery,
  NetworkParametersQuery_networkParameters,
} from './__generated__/NetworkParametersQuery';
import orderBy from 'lodash/orderBy';

const BIG_NUMBER_PARAMS = [
  'spam.protection.delegation.min.tokens',
  'validators.delegation.minAmount',
  'reward.staking.delegation.minimumValidatorStake',
  'reward.staking.delegation.maxPayoutPerParticipant',
  'reward.staking.delegation.maxPayoutPerEpoch',
  'spam.protection.voting.min.tokens',
  'governance.proposal.freeform.minProposerBalance',
  'governance.proposal.updateNetParam.minVoterBalance',
  'governance.proposal.updateMarket.minVoterBalance',
  'governance.proposal.asset.minVoterBalance',
  'governance.proposal.updateNetParam.minProposerBalance',
  'governance.proposal.freeform.minVoterBalance',
  'spam.protection.proposal.min.tokens',
  'governance.proposal.updateMarket.minProposerBalance',
  'governance.proposal.asset.minProposerBalance',
];

export const renderRow = ({
  key,
  value,
}: NetworkParametersQuery_networkParameters) => {
  const isSyntaxRow = isJsonObject(value);
  return (
    <KeyValueTableRow
      key={key}
      inline={!isSyntaxRow}
      id={key}
      className={
        'group target:bg-vega-pink target:text-white dark:target:bg-vega-yellow dark:target:text-black'
      }
    >
      {key}
      {isSyntaxRow ? (
        <SyntaxHighlighter data={JSON.parse(value)} />
      ) : isNaN(Number(value)) ? (
        value
      ) : BIG_NUMBER_PARAMS.includes(key) ? (
        addDecimalsFormatNumber(Number(value), 18)
      ) : (
        formatNumber(Number(value), 4)
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
  error?: Error;
  loading: boolean;
}

export const NetworkParametersTable = ({
  data,
  error,
  loading,
}: NetworkParametersTableProps) => (
  <section>
    <RouteTitle data-testid="network-param-header">
      {t('Network Parameters')}
    </RouteTitle>

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
          <KeyValueTable data-testid="parameters">
            {(ascParams || []).map((row) => renderRow(row))}
          </KeyValueTable>
        );
      }}
    />
  </section>
);

export const NetworkParameters = () => {
  const { data, loading, error } = useQuery<NetworkParametersQuery>(
    NETWORK_PARAMETERS_QUERY
  );
  return <NetworkParametersTable data={data} error={error} loading={loading} />;
};

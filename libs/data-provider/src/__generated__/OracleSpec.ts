import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import { DataSourceFragmentDoc } from '../../../../../libs/markets/src/lib/components/market-info/__generated__/MarketInfo';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type OracleSpecQueryVariables = Types.Exact<{
  oracleSpecId: Types.Scalars['ID'];
}>;


export type OracleSpecQuery = { __typename?: 'Query', oracleSpec?: { __typename?: 'OracleSpec', dataSourceSpec: { __typename?: 'ExternalDataSourceSpec', spec: { __typename?: 'DataSourceSpec', id: string, data: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } | { __typename?: 'EthCallSpec', abi?: Array<string> | null, address: string, args?: Array<string> | null, method: string, requiredConfirmations: number, normalisers?: Array<{ __typename?: 'Normaliser', name: string, expression: string }> | null, trigger: { __typename?: 'EthCallTrigger', trigger: { __typename?: 'EthTimeTrigger', initial?: any | null, every?: number | null, until?: any | null } }, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } | { __typename: 'DataSourceSpecConfigurationTimeTrigger', triggers: Array<{ __typename?: 'InternalTimeTrigger', initial?: number | null, every?: number | null } | null>, conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } } } } } } | null };


export const OracleSpecDocument = gql`
    query OracleSpec($oracleSpecId: ID!) {
  oracleSpec(oracleSpecId: $oracleSpecId) {
    dataSourceSpec {
      spec {
        ...DataSource
      }
    }
  }
}
    ${DataSourceFragmentDoc}`;

/**
 * __useOracleSpecQuery__
 *
 * To run a query within a React component, call `useOracleSpecQuery` and pass it any options that fit your needs.
 * When your component renders, `useOracleSpecQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOracleSpecQuery({
 *   variables: {
 *      oracleSpecId: // value for 'oracleSpecId'
 *   },
 * });
 */
export function useOracleSpecQuery(baseOptions: Apollo.QueryHookOptions<OracleSpecQuery, OracleSpecQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<OracleSpecQuery, OracleSpecQueryVariables>(OracleSpecDocument, options);
      }
export function useOracleSpecLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<OracleSpecQuery, OracleSpecQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<OracleSpecQuery, OracleSpecQueryVariables>(OracleSpecDocument, options);
        }
export type OracleSpecQueryHookResult = ReturnType<typeof useOracleSpecQuery>;
export type OracleSpecLazyQueryHookResult = ReturnType<typeof useOracleSpecLazyQuery>;
export type OracleSpecQueryResult = Apollo.QueryResult<OracleSpecQuery, OracleSpecQueryVariables>;
import { render } from '@testing-library/react';
import { getConditionsOrFilters, OracleFilter } from './oracle-filter';
import type { Filter } from './oracle-filter';
import type { ExplorerOracleDataSourceFragment } from '../__generated__/Oracles';
import {
  ConditionOperator,
  DataSourceSpecStatus,
  PropertyKeyType,
} from '@vegaprotocol/types';

const mockExternalSpec = {
  sourceType: {
    __typename: 'DataSourceSpecConfiguration',
    filters: [
      {
        __typename: 'Filter',
        key: {
          type: PropertyKeyType.TYPE_INTEGER,
          name: 'test',
        },
        conditions: [
          {
            __typename: 'Condition',
            value: 'test',
            operator: ConditionOperator.OPERATOR_EQUALS,
          },
        ],
      },
    ],
  },
};

const mockTimeSpec = {
  __typename: 'DataSourceSpecConfigurationTime',
  conditions: [
    {
      value: '123',
      operator: ConditionOperator.OPERATOR_EQUALS,
    },
  ],
};

function renderComponent(data: ExplorerOracleDataSourceFragment) {
  return <OracleFilter data={data} />;
}

describe('Oracle Filter view', () => {
  it('Renders nothing when data is null', () => {
    const res = render(
      renderComponent(null as unknown as ExplorerOracleDataSourceFragment)
    );
    expect(res.container).toBeEmptyDOMElement();
  });

  it('Renders nothing when data is empty', () => {
    const res = render(renderComponent({} as ExplorerOracleDataSourceFragment));
    expect(res.container).toBeEmptyDOMElement();
  });

  it('Renders filters if type is DataSourceSpecConfiguration', () => {
    const res = render(
      renderComponent({
        dataSourceSpec: {
          spec: {
            id: 'irrelevant-test-data',
            createdAt: 'irrelevant-test-data',
            status: DataSourceSpecStatus.STATUS_ACTIVE,
            data: {
              sourceType: mockExternalSpec,
            },
          },
        },
      } as ExplorerOracleDataSourceFragment)
    );

    expect(res.getByText('Filter')).toBeInTheDocument();
    // Avoids asserting on how the data is presented because it is very rudimentary
  });

  it('Renders conditions if type is DataSourceSpecConfigurationTime', () => {
    const res = render(
      renderComponent({
        dataSourceSpec: {
          spec: {
            id: 'irrelevant-test-data',
            createdAt: 'irrelevant-test-data',
            status: DataSourceSpecStatus.STATUS_ACTIVE,
            data: {
              sourceType: {
                __typename: 'DataSourceDefinitionInternal',
                sourceType: mockTimeSpec,
              },
            },
          },
        },
      } as ExplorerOracleDataSourceFragment)
    );

    expect(res.getByText('Filter')).toBeInTheDocument();
    // Avoids asserting on how the data is presented because it is very rudimentary
  });
});

describe('getConditionsOrFilter', () => {
  it('Returns null if the type is undetermined (not DataSourceSpecConfiguration or DataSourceSpecConfigurationTime', () => {
    expect(getConditionsOrFilters({})).toBeNull();
  });

  it('Returns the conditions object for time specs', () => {
    const mock: Filter = {
      __typename: 'DataSourceSpecConfigurationTime',
      conditions: [
        {
          __typename: 'Condition',
          value: '100',
          operator: ConditionOperator.OPERATOR_GREATER_THAN,
        },
      ],
    };
    const res = getConditionsOrFilters(mock);
    // This ugly construction is due to lazy typing on getConditionsOrFilter
    if (!res || res.length !== 1 || !res[0] || 'key' in res[0]) {
      throw new Error(
        'getConditionsOrFilter did not return conditions on a time spec'
      );
    }

    expect(res[0].__typename).toEqual('Condition');
  });

  it('Returns the filters object for external specs', () => {
    const mock: Filter = {
      __typename: 'DataSourceSpecConfiguration',
      filters: [
        {
          __typename: 'Filter',
          key: {
            type: PropertyKeyType.TYPE_INTEGER,
            name: 'test',
          },
          conditions: [
            {
              __typename: 'Condition',
              value: 'test',
              operator: ConditionOperator.OPERATOR_EQUALS,
            },
          ],
        },
      ],
    };

    const res = getConditionsOrFilters(mock);
    // This ugly construction is due to lazy typing on getConditionsOrFilter
    if (!res || res.length !== 1 || !res[0] || 'value' in res[0]) {
      throw new Error(
        'getConditionsOrFilter did not return filters on a external spec'
      );
    }

    expect(res[0].__typename).toEqual('Filter');
  });
});

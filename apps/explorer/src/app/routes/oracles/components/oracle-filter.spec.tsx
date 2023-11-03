import { render } from '@testing-library/react';
import { OracleFilter } from './oracle-filter';
import type { ExplorerOracleDataSourceFragment } from '../__generated__/Oracles';
import {
  ConditionOperator,
  DataSourceSpecStatus,
  PropertyKeyType,
} from '@vegaprotocol/types';
import type { Condition } from '@vegaprotocol/types';

type Spec =
  ExplorerOracleDataSourceFragment['dataSourceSpec']['spec']['data']['sourceType'];

const mockExternalSpec: Spec = {
  sourceType: {
    __typename: 'DataSourceSpecConfiguration',
    filters: [
      {
        __typename: 'Filter',
        key: {
          type: PropertyKeyType.TYPE_INTEGER,
          name: 'testKey',
        },
        conditions: [
          {
            __typename: 'Condition',
            value: 'testValue',
            operator: ConditionOperator.OPERATOR_EQUALS,
          },
        ],
      },
    ],
  },
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
        dataConnection: {
          edges: [],
        },
      })
    );

    // Renders a comprehensible summary of key = value
    expect(res.getByText('testKey')).toBeInTheDocument();
    expect(res.getByText('=')).toBeInTheDocument();
    expect(res.getByText('testValue')).toBeInTheDocument();
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
                sourceType: {
                  __typename: 'DataSourceSpecConfigurationTime',
                  conditions: [
                    {
                      value: '1',
                      operator: ConditionOperator.OPERATOR_EQUALS,
                    },
                  ],
                },
              },
            },
          },
        },
        dataConnection: {
          edges: [],
        },
      })
    );

    expect(res.getByText('Time')).toBeInTheDocument();
    expect(res.getByText('=')).toBeInTheDocument();
    expect(res.getByTitle('1').textContent).toMatch(/1970/);
    // Avoids asserting on how the data is presented because it is very rudimentary
  });

  it('DataSourceSpecConfigurationTime handles empty conditions', () => {
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
                sourceType: {
                  __typename: 'DataSourceSpecConfigurationTime',
                  conditions: [undefined as unknown as Condition],
                },
              },
            },
          },
        },
        dataConnection: {
          edges: [],
        },
      })
    );

    // This should never happen, but for coverage sake we test that it does this
    const ul = res.getByRole('list');
    expect(ul).toBeInTheDocument();
    expect(ul).toBeEmptyDOMElement();
  });
});

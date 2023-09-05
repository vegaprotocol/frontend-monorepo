import { render, screen } from '@testing-library/react';
import type { NetworkParamsQuery } from '@vegaprotocol/network-parameters';
import { NetworkParametersTable } from './network-parameters';

describe('NetworkParametersTable', () => {
  it('renders correctly when it has network params', () => {
    const data: NetworkParamsQuery = {
      networkParametersConnection: {
        edges: [
          {
            node: {
              __typename: 'NetworkParameter',
              key: 'market.liquidityProvision.minLpStakeQuantumMultiple',
              value: '1',
            },
          },
          {
            node: {
              __typename: 'NetworkParameter',
              key: 'market.fee.factors.infrastructureFee',
              value: '0.0005',
            },
          },
        ],
      },
    };
    render(<NetworkParametersTable data={data} loading={false} />);
    expect(screen.getByTestId('network-param-header')).toHaveTextContent(
      'Network Parameters'
    );
    const rows = screen.getAllByTestId('key-value-table-row');
    expect(rows[0].children[0]).toHaveTextContent(
      'market.fee.factors.infrastructureFee'
    );
    expect(rows[1].children[0]).toHaveTextContent(
      'market.liquidityProvision.minLpStakeQuantumMultiple'
    );
    expect(rows[0].children[1]).toHaveTextContent('0.0005');
    expect(rows[1].children[1]).toHaveTextContent('1');
  });

  it('renders the rows in ascending order', () => {
    const data: NetworkParamsQuery = {
      networkParametersConnection: {
        edges: [
          {
            node: {
              __typename: 'NetworkParameter',
              key: 'market.fee.factors.infrastructureFee',
              value: '0.0005',
            },
          },
          {
            node: {
              __typename: 'NetworkParameter',
              key: 'market.liquidityProvision.minLpStakeQuantumMultiple',
              value: '1',
            },
          },
        ],
      },
    };
    render(<NetworkParametersTable data={data} loading={false} />);
    expect(screen.getByTestId('network-param-header')).toHaveTextContent(
      'Network Parameters'
    );
    const rows = screen.getAllByTestId('key-value-table-row');
    expect(rows[0].children[0]).toHaveTextContent(
      'market.fee.factors.infrastructureFee'
    );
    expect(rows[1].children[0]).toHaveTextContent(
      'market.liquidityProvision.minLpStakeQuantumMultiple'
    );
    expect(rows[0].children[1]).toHaveTextContent('0.0005');
    expect(rows[1].children[1]).toHaveTextContent('1');
  });

  it('does not render rows when is loading', () => {
    render(<NetworkParametersTable data={undefined} loading={true} />);
    expect(screen.getByTestId('network-param-header')).toHaveTextContent(
      'Network Parameters'
    );
    expect(screen.queryByTestId('key-value-table-row')).not.toBeInTheDocument();
  });
});

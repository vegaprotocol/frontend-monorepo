import { render, screen } from '@testing-library/react';
import { NetworkParametersTable } from './network-parameters';
import type { NetworkParametersQuery } from './__generated__/NetworkParametersQuery';

describe('NetworkParametersTable', () => {
  it('renders correctly when it has network params', () => {
    const data: NetworkParametersQuery = {
      networkParameters: [
        {
          __typename: 'NetworkParameter',
          key: 'market.liquidityProvision.minLpStakeQuantumMultiple',
          value: '1',
        },
        {
          __typename: 'NetworkParameter',
          key: 'market.fee.factors.infrastructureFee',
          value: '0.0005',
        },
      ],
    };
    const { container } = render(<NetworkParametersTable data={data} />);
    expect(screen.getByTestId('network-param-header')).toHaveTextContent(
      'Network Parameters'
    );
    const rows = container.getElementsByTagName('dl');
    expect(rows[0].children[0]).toHaveTextContent(
      'market.liquidityProvision.minLpStakeQuantumMultiple'
    );
    expect(rows[1].children[0]).toHaveTextContent(
      'market.fee.factors.infrastructureFee'
    );
    expect(rows[0].children[1]).toHaveTextContent('1');
    expect(rows[1].children[1]).toHaveTextContent('0.0005');
  });
});

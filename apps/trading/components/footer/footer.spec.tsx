import { fireEvent, render, screen } from '@testing-library/react';
import { Footer } from './footer';
import { useEnvironment } from '@vegaprotocol/environment';

jest.mock('@vegaprotocol/environment');

describe('Footer', () => {
  it('renders a button to open node switcher', () => {
    const mockOpenNodeSwitcher = jest.fn();
    const node = 'n99.somenetwork.vega.xyz';
    const nodeUrl = `https://${node}`;

    // @ts-ignore mock env hook
    useEnvironment.mockImplementation(() => ({
      VEGA_URL: `https://api.${node}/graphql`,
      setNodeSwitcherOpen: mockOpenNodeSwitcher,
    }));

    render(<Footer />);

    fireEvent.click(screen.getByRole('button'));
    expect(mockOpenNodeSwitcher).toHaveBeenCalled();
    const link = screen.getByText(node);
    expect(link).toHaveAttribute('href', nodeUrl);
  });
});

import { fireEvent, render, screen } from '@testing-library/react';
import { Footer, NodeHealth } from './footer';
import { useEnvironment, useNodeHealth } from '@vegaprotocol/environment';

jest.mock('@vegaprotocol/environment');

describe('Footer', () => {
  it('can open node switcher by clicking the node url', () => {
    const mockOpenNodeSwitcher = jest.fn();
    const node = 'n99.somenetwork.vega.xyz';

    // @ts-ignore mock env hook
    useEnvironment.mockImplementation(() => ({
      VEGA_URL: `https://api.${node}/graphql`,
      setNodeSwitcherOpen: mockOpenNodeSwitcher,
    }));

    // @ts-ignore mock env hook
    useNodeHealth.mockImplementation(() => ({
      blockDiff: 0,
    }));

    render(<Footer />);

    fireEvent.click(screen.getByText(node));
    expect(mockOpenNodeSwitcher).toHaveBeenCalled();
  });

  it('can open node switcher by clicking health', () => {
    const mockOpenNodeSwitcher = jest.fn();
    const node = 'n99.somenetwork.vega.xyz';

    // @ts-ignore mock env hook
    useEnvironment.mockImplementation(() => ({
      VEGA_URL: `https://api.${node}/graphql`,
      setNodeSwitcherOpen: mockOpenNodeSwitcher,
    }));

    // @ts-ignore mock env hook
    useNodeHealth.mockImplementation(() => ({
      blockDiff: 0,
    }));

    render(<Footer />);

    fireEvent.click(screen.getByText('Operational'));
    expect(mockOpenNodeSwitcher).toHaveBeenCalled();
  });
});

describe('NodeHealth', () => {
  const cases = [
    { diff: 0, classname: 'bg-success', text: 'Operational' },
    { diff: -1, classname: 'bg-success', text: 'Operational' },
    { diff: 5, classname: 'bg-warning', text: '5 Blocks behind' },
    { diff: null, classname: 'bg-danger', text: 'Non operational' },
  ];
  it.each(cases)(
    'renders correct text and indicator color for $diff block difference',
    (elem) => {
      render(<NodeHealth blockDiff={elem.diff} openNodeSwitcher={jest.fn()} />);
      expect(screen.getByTestId('indicator')).toHaveClass(elem.classname);
      expect(screen.getByText(elem.text)).toBeInTheDocument();
    }
  );
});

import { fireEvent, render, screen } from '@testing-library/react';
import { Footer, NodeHealth } from './footer';
import type { NodeHealth as HealthType } from '@vegaprotocol/environment';
import { Health, useEnvironment } from '@vegaprotocol/environment';

jest.mock('@vegaprotocol/environment');

describe('Footer', () => {
  it('can open node switcher by clicking the node url', () => {
    const mockOpenNodeSwitcher = jest.fn();
    const node = 'n99.somenetwork.vega.xyz';

    // @ts-ignore mock env hook
    useEnvironment.mockImplementation(() => ({
      VEGA_URL: `https://api.${node}/graphql`,
      nodeHealth: Health.Good,
      setNodeSwitcherOpen: mockOpenNodeSwitcher,
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
      nodeHealth: Health.Good,
      setNodeSwitcherOpen: mockOpenNodeSwitcher,
    }));

    render(<Footer />);

    fireEvent.click(screen.getByText(Health.Good));
    expect(mockOpenNodeSwitcher).toHaveBeenCalled();
  });
});

describe('NodeHealth', () => {
  const classmap: {
    [H in HealthType]: string;
  } = {
    [Health.Good]: 'bg-success',
    [Health.Bad]: 'bg-warning',
    [Health.Critical]: 'bg-danger',
  };
  it.each(Object.keys(Health))(
    'renders an indicator color for %s health',
    (health) => {
      render(<NodeHealth health={health} openNodeSwitcher={jest.fn()} />);
      expect(screen.getByTestId('indicator')).toHaveClass(classmap[health]);
    }
  );
});

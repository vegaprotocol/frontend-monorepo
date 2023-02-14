import { fireEvent, render, screen, within } from '@testing-library/react';
import { NodeSwitcher } from './node-switcher';
import type { EnvStore } from '../../hooks';
import { useEnvironment } from '../../hooks';
import { Networks } from '../../types';
import { MockedProvider } from '@apollo/react-testing';
import type { ReactNode } from 'react';

jest.mock('../../hooks/use-environment');
jest.mock('./apollo-wrapper', () => ({
  ApolloWrapper: jest.fn(({ children }: { children: ReactNode }) => (
    <MockedProvider>{children}</MockedProvider>
  )),
}));

global.performance.getEntriesByName = jest.fn().mockReturnValue([]);

const mockEnv = (env: Partial<EnvStore>) => {
  (useEnvironment as unknown as jest.Mock).mockImplementation(() => env);
};

describe('NodeSwitcherContainer', () => {
  it('renders with no nodes', () => {
    mockEnv({
      VEGA_ENV: Networks.TESTNET,
      nodes: [],
    });
    render(<NodeSwitcher closeDialog={jest.fn()} />);
    expect(
      screen.getByText(Networks.TESTNET.toLowerCase())
    ).toBeInTheDocument();
    expect(screen.queryAllByTestId('node')).toHaveLength(0);
    expect(
      screen.getByRole('button', { name: 'Connect to this node' })
    ).toHaveAttribute('disabled');
  });

  it('renders with nodes', async () => {
    const nodes = [
      'https://n00.api.vega.xyz',
      'https://n01.api.vega.xyz',
      'https://n02.api.vega.xyz',
    ];
    mockEnv({
      VEGA_ENV: Networks.TESTNET,
      nodes,
    });
    render(<NodeSwitcher closeDialog={jest.fn()} />);
    nodes.forEach((node) => {
      expect(
        screen.getByRole('radio', { checked: false, name: node })
      ).toBeInTheDocument();
    });
    expect(
      screen.getByRole('radio', { checked: false, name: 'Other' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Connect to this node' })
    ).toHaveAttribute('disabled');

    const rows = screen.getAllByTestId('node-row');
    expect(rows).toHaveLength(nodes.length);
    rows.forEach((r) => {
      const row = within(r);
      expect(row.getByTestId('response-time-cell')).toHaveTextContent(
        'Checking'
      );
      expect(row.getByTestId('block-height-cell')).toHaveTextContent(
        'Checking'
      );
    });

    // Note actual requests tested in
  });

  it('marks current node as selected', () => {
    const nodes = [
      'https://n00.api.vega.xyz',
      'https://n01.api.vega.xyz',
      'https://n02.api.vega.xyz',
    ];
    const selectedNode = nodes[0];
    mockEnv({
      VEGA_ENV: Networks.TESTNET,
      VEGA_URL: selectedNode,
      nodes,
    });
    render(<NodeSwitcher closeDialog={jest.fn()} />);

    nodes.forEach((node) => {
      expect(
        screen.getByRole('radio', {
          checked: node === selectedNode,
          name: node,
        })
      ).toBeInTheDocument();
    });
    expect(
      screen.getByRole('radio', { checked: false, name: 'Other' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Connect to this node' })
    ).toHaveAttribute('disabled');
  });

  it('allows setting a custom node', () => {
    const mockSetUrl = jest.fn();
    const mockUrl = 'https://custom.url';
    const nodes = ['https://n00.api.vega.xyz'];
    mockEnv({
      VEGA_ENV: Networks.TESTNET,
      nodes,
      setUrl: mockSetUrl,
    });
    render(<NodeSwitcher closeDialog={jest.fn()} />);
    expect(
      screen.getByRole('button', { name: 'Connect to this node' })
    ).toBeDisabled();

    fireEvent.click(screen.getByRole('radio', { name: 'Other' }));

    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: mockUrl,
      },
    });

    expect(screen.getByRole('textbox')).toHaveValue(mockUrl);
    expect(screen.getByRole('button', { name: 'Check' })).not.toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Check' }));

    const customRow = within(screen.getByTestId('custom-row'));
    expect(customRow.getByTestId('block-height-cell')).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: 'Connect to this node' })
    );
    expect(mockSetUrl).toHaveBeenCalledWith(mockUrl);
  });

  it('disables a custom node with an invalid url', () => {
    const mockSetUrl = jest.fn();
    const mockUrl = 'invalid-url';
    const nodes = [
      'https://n00.api.vega.xyz',
      'https://n01.api.vega.xyz',
      'https://n02.api.vega.xyz',
    ];
    mockEnv({
      VEGA_ENV: Networks.TESTNET,
      nodes,
      setUrl: mockSetUrl,
    });
    render(<NodeSwitcher closeDialog={jest.fn()} />);
    expect(
      screen.getByRole('button', { name: 'Connect to this node' })
    ).toBeDisabled();

    fireEvent.click(screen.getByRole('radio', { name: 'Other' }));
    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: mockUrl,
      },
    });
    expect(
      screen.getByRole('button', {
        name: 'Connect to this node',
      })
    ).toBeDisabled();
  });

  it.todo('displays errors');
});

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NodeHealthContainer, NodeUrl } from './node-health';
import { MockedProvider } from '@apollo/client/testing';

const mockSetNodeSwitcher = jest.fn();

jest.mock('@vegaprotocol/environment', () => ({
  ...jest.requireActual('@vegaprotocol/environment'),
  useEnvironment: jest.fn().mockImplementation(() => ({
    VEGA_URL: 'https://vega-url.wtf',
    VEGA_INCIDENT_URL: 'https://blog.vega.community',
  })),
  useNodeSwitcherStore: jest.fn(() => mockSetNodeSwitcher),
}));

describe('NodeHealthContainer', () => {
  it('controls the node switcher dialog', async () => {
    render(<NodeHealthContainer />, { wrapper: MockedProvider });
    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByRole('button'));
    expect(mockSetNodeSwitcher).toHaveBeenCalled();
  });

  it('Shows node health data on hover', async () => {
    render(<NodeHealthContainer />, { wrapper: MockedProvider });
    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
    await userEvent.hover(screen.getByRole('button'));
    await waitFor(() => {
      const portal = within(
        document.querySelector(
          '[data-radix-popper-content-wrapper]'
        ) as HTMLElement
      );
      // two tooltips get rendered, I believe for animation purposes
      const tooltip = within(portal.getAllByTestId('tooltip-content')[0]);
      expect(
        tooltip.getByRole('link', { name: /^Mainnet status & incidents/ })
      ).toBeInTheDocument();
      expect(tooltip.getByText(/Status:/)).toBeInTheDocument();
      expect(tooltip.getByTitle('Connected node')).toHaveTextContent(
        'vega-url.wtf'
      );
      expect(tooltip.getByText(/Block height:/)).toBeInTheDocument();
    });
  });
});

describe('NodeUrl', () => {
  it('renders correct part of node url', () => {
    const node = 'https://api.n99.somenetwork.vega.xyz';

    render(<NodeUrl url={node} />);

    expect(
      screen.getByText('api.n99.somenetwork.vega.xyz')
    ).toBeInTheDocument();
  });
});

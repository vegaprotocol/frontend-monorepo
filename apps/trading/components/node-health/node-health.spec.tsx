import { render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { NodeHealthContainer, NodeUrl } from './node-health';
import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import {
  NodeCheckDocument,
  type NodeCheckQuery,
} from '@vegaprotocol/environment';

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
  const blockHeight = '1';
  const nodeCheckMock: MockedResponse<NodeCheckQuery, never> = {
    request: {
      query: NodeCheckDocument,
    },
    result: {
      data: {
        statistics: {
          chainId: 'chain-id',
          blockHeight: blockHeight,
          vegaTime: '12345',
        },
        networkParametersConnection: {
          edges: [
            {
              node: {
                key: 'a',
                value: '1',
              },
            },
          ],
        },
      },
    },
  };

  const renderComponent = (mocks: MockedResponse[] = []) => {
    return render(
      <MemoryRouter>
        <MockedProvider mocks={mocks}>
          <NodeHealthContainer />
        </MockedProvider>
      </MemoryRouter>
    );
  };

  it('controls the node switcher dialog', async () => {
    renderComponent([nodeCheckMock]);
    expect(await screen.findByRole('button')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button'));
    expect(mockSetNodeSwitcher).toHaveBeenCalled();
  });

  it('Shows node health data on hover', async () => {
    renderComponent([nodeCheckMock]);
    expect(await screen.findByRole('button')).toBeInTheDocument();
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
      expect(tooltip.getByText('Operational')).toBeInTheDocument();
      expect(tooltip.getByTitle('Connected node')).toHaveTextContent(
        'vega-url.wtf'
      );
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

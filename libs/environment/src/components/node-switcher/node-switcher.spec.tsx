import { useState } from 'react';
import { MockedProvider } from '@apollo/react-testing';
import { render, screen, fireEvent } from '@testing-library/react';
import { useEnvironment } from '../../hooks/use-environment';
import { useNodes } from '../../hooks/use-nodes';
import createMockClient from '../../hooks/mocks/apollo-client';
import { STATS_QUERY } from '../../utils/request-node';
import { NodeSwitcher } from './node-switcher';
import { getErrorByType } from '../../utils/validate-node';
import type { Configuration, NodeData } from '../../types';
import { Networks, ErrorType, CUSTOM_NODE_KEY } from '../../types';

type NodeDataProp = 'responseTime' | 'block' | 'chain' | 'ssl';

jest.mock('../../hooks/use-environment');
jest.mock('../../hooks/use-nodes');

const mockNodesImplementation =
  (
    updateNodeUrlMock: jest.Mock,
    getNodeState: typeof getValidNodeState = getValidNodeState
  ) =>
  (config: Configuration) => {
    const [{ state, clients }, setImplementation] = useState<{
      state: Record<string, NodeData>;
      clients: Record<string, ReturnType<typeof createMockClients>>;
    }>({
      state: createMockState(Networks.TESTNET, config.hosts),
      clients: createMockClients(config.hosts),
    });

    return {
      state,
      clients,
      updateNodeUrl: updateNodeUrlMock.mockImplementation(
        (node: string, url: string) => {
          setImplementation((prev) => ({
            state: {
              ...prev.state,
              [node]: getNodeState(Networks.TESTNET, url),
            },
            clients: {
              ...prev.clients,
              [node]: createMockClient({ network: Networks.TESTNET }),
            },
          }));
        }
      ),
      updateNodeBlock: (node: string, value: number) => {
        setImplementation((prev) => ({
          state: {
            ...prev.state,
            [node]: {
              ...prev.state[node],
              block: {
                ...prev.state[node].block,
                value,
              },
            },
          },
          clients: prev.clients,
        }));
      },
    };
  };

const statsQueryMock = {
  request: {
    query: STATS_QUERY,
  },
  result: {
    data: {
      statistics: {
        blockHeight: 1234,
      },
    },
  },
};

const onConnect = jest.fn();

const HOSTS = ['https://host1.com', 'https://host2.com'];

const enum STATES {
  LOADING = 'is loading',
  HAS_ERROR = 'has an error',
}

const getValidNodeState = (env: Networks, url: string) => ({
  url,
  initialized: true,
  responseTime: {
    isLoading: false,
    hasError: false,
    value: 10,
  },
  block: {
    isLoading: false,
    hasError: false,
    value: 123,
  },
  ssl: {
    isLoading: false,
    hasError: false,
    value: true,
  },
  chain: {
    isLoading: false,
    hasError: false,
    value: `${env.toLowerCase()}-1234`,
  },
});

const createMockState = (env: Networks, nodes: string[]) =>
  nodes.reduce(
    (acc, node) => ({
      ...acc,
      [node]: getValidNodeState(env, node),
    }),
    {}
  );

const createMockClients = (nodes: string[]) =>
  nodes.reduce(
    (acc, node) => ({
      ...acc,
      [node]: createMockClient({ network: Networks.TESTNET }),
    }),
    {}
  );

beforeEach(() => {
  onConnect.mockReset();

  // @ts-ignore Typescript doesn't recognise mocked instances
  useEnvironment.mockImplementation(() => ({
    VEGA_ENV: Networks.TESTNET,
    VEGA_URL: undefined,
  }));

  // @ts-ignore Typescript doesn't recognise mocked instances
  useNodes.mockImplementation((config: Configuration) => ({
    state: createMockState(Networks.TESTNET, config.hosts),
    clients: createMockClients(config.hosts),
    updateNodeUrl: jest.fn(),
    updateNodeBlock: jest.fn(),
  }));
});

describe('Node switcher', () => {
  it('renders with empty config', () => {
    render(<NodeSwitcher config={{ hosts: [] }} onConnect={onConnect} />);

    expect(() => screen.getAllByTestId('node')).toThrow();
    expect(screen.getByRole('radio', { checked: false })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Connect' })).toHaveAttribute(
      'disabled'
    );
  });

  it('renders with the provided config nodes', () => {
    render(<NodeSwitcher config={{ hosts: HOSTS }} onConnect={onConnect} />);

    HOSTS.forEach((host) => {
      expect(
        screen.getByRole('radio', { checked: false, name: host })
      ).toBeInTheDocument();
    });
    expect(
      screen.getByRole('radio', { checked: false, name: 'Other' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Connect' })).toHaveAttribute(
      'disabled'
    );
  });

  it('marks the node in the environment as selected', () => {
    // @ts-ignore Typescript doesn't recognise mocked instances
    useEnvironment.mockImplementation(() => ({
      VEGA_ENV: Networks.TESTNET,
      VEGA_URL: HOSTS[0],
    }));
    render(<NodeSwitcher config={{ hosts: HOSTS }} onConnect={onConnect} />);

    HOSTS.forEach((host) => {
      expect(
        screen.getByRole('radio', { checked: host === HOSTS[0], name: host })
      ).toBeInTheDocument();
    });
    expect(
      screen.getByRole('radio', { checked: false, name: 'Other' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Connect' })).not.toHaveAttribute(
      'disabled'
    );
  });

  it.each`
    dataProp          | state
    ${'responseTime'} | ${STATES.LOADING}
    ${'responseTime'} | ${STATES.HAS_ERROR}
    ${'block'}        | ${STATES.LOADING}
    ${'block'}        | ${STATES.HAS_ERROR}
    ${'chain'}        | ${STATES.LOADING}
    ${'chain'}        | ${STATES.HAS_ERROR}
    ${'ssl'}          | ${STATES.LOADING}
    ${'ssl'}          | ${STATES.HAS_ERROR}
  `(
    'disables selecting a node when the $dataProp $state',
    ({ dataProp, state }: { dataProp: NodeDataProp; state: STATES }) => {
      const mockUrl = 'https://host.url';
      const mockConfig = {
        hosts: [mockUrl],
      };

      // @ts-ignore Typescript doesn't recognise mocked instances
      useNodes.mockImplementation((config: Configuration) => {
        const nodeState = getValidNodeState(Networks.TESTNET, mockUrl);
        return {
          state: {
            [mockUrl]: {
              ...nodeState,
              [dataProp]: {
                ...nodeState[dataProp],
                isLoading:
                  state === STATES.LOADING
                    ? true
                    : nodeState[dataProp].isLoading,
                hasError:
                  state === STATES.HAS_ERROR
                    ? true
                    : nodeState[dataProp].hasError,
                value: undefined,
              },
            },
          },
          clients: createMockClients(config.hosts),
          updateNodeUrl: jest.fn(),
          updateNodeBlock: jest.fn(),
        };
      });

      render(
        <MockedProvider mocks={[statsQueryMock]}>
          <NodeSwitcher config={mockConfig} onConnect={onConnect} />
        </MockedProvider>
      );

      expect(screen.getByRole('radio', { name: mockUrl })).toHaveAttribute(
        'disabled'
      );
      expect(screen.getByRole('button', { name: 'Connect' })).toHaveAttribute(
        'disabled'
      );
    }
  );

  it('disables selecting a node when it has an invalid url', () => {
    const mockUrl = 'not-valid-url';
    const mockConfig = {
      hosts: [mockUrl],
    };

    // @ts-ignore Typescript doesn't recognise mocked instances
    useNodes.mockImplementation((config: Configuration) => ({
      state: {
        [mockUrl]: getValidNodeState(Networks.TESTNET, mockUrl),
      },
      clients: createMockClients(config.hosts),
      updateNodeUrl: jest.fn(),
      updateNodeBlock: jest.fn(),
    }));

    render(
      <MockedProvider mocks={[statsQueryMock]}>
        <NodeSwitcher config={mockConfig} onConnect={onConnect} />
      </MockedProvider>
    );

    expect(screen.getByRole('radio', { name: mockUrl })).toHaveAttribute(
      'disabled'
    );
    expect(screen.getByRole('button', { name: 'Connect' })).toHaveAttribute(
      'disabled'
    );
  });

  it('disables selecting a node when it is on an incorrect network', () => {
    const mockUrl = 'https://mock.url';
    const mockConfig = {
      hosts: [mockUrl],
    };

    // @ts-ignore Typescript doesn't recognise mocked instances
    useNodes.mockImplementation((config: Configuration) => {
      const nodeState = getValidNodeState(Networks.TESTNET, mockUrl);
      return {
        state: {
          [mockUrl]: {
            ...nodeState,
            chain: {
              ...nodeState.chain,
              value: `some-network-id`,
            },
          },
        },
        clients: createMockClients(config.hosts),
        updateNodeUrl: jest.fn(),
        updateNodeBlock: jest.fn(),
      };
    });

    render(
      <MockedProvider mocks={[statsQueryMock]}>
        <NodeSwitcher config={mockConfig} onConnect={onConnect} />
      </MockedProvider>
    );

    expect(screen.getByRole('radio', { name: mockUrl })).toHaveAttribute(
      'disabled'
    );
    expect(screen.getByRole('button', { name: 'Connect' })).toHaveAttribute(
      'disabled'
    );
  });

  it('allows connecting to a valid node', () => {
    render(<NodeSwitcher config={{ hosts: HOSTS }} onConnect={onConnect} />);

    expect(screen.getByRole('button', { name: 'Connect' })).toHaveAttribute(
      'disabled'
    );
    fireEvent.click(screen.getByRole('radio', { name: HOSTS[0] }));

    expect(screen.getByRole('button', { name: 'Connect' })).not.toHaveAttribute(
      'disabled'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Connect' }));

    expect(onConnect).toHaveBeenCalledWith(HOSTS[0]);
  });

  it('allows checking a custom node', () => {
    const updateNodeUrlMock = jest.fn();

    // @ts-ignore Typescript doesn't recognise mocked instances
    useNodes.mockImplementation((config: Configuration) => ({
      state: createMockState(Networks.TESTNET, config.hosts),
      clients: createMockClients(config.hosts),
      updateNodeUrl: updateNodeUrlMock,
      updateNodeBlock: jest.fn(),
    }));

    const mockUrl = 'https://custom.url';
    render(
      <MockedProvider mocks={[statsQueryMock]}>
        <NodeSwitcher config={{ hosts: [] }} onConnect={onConnect} />
      </MockedProvider>
    );

    expect(screen.getByRole('button', { name: 'Connect' })).toHaveAttribute(
      'disabled'
    );

    fireEvent.click(screen.getByRole('radio', { name: 'Other' }));
    expect(screen.getByRole('link', { name: 'Check' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(screen.getByRole('button', { name: 'Connect' })).toHaveAttribute(
      'disabled'
    );

    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: mockUrl,
      },
    });

    expect(screen.getByRole('link', { name: 'Check' })).toHaveAttribute(
      'aria-disabled',
      'false'
    );
    expect(screen.getByRole('button', { name: 'Connect' })).toHaveAttribute(
      'disabled'
    );

    fireEvent.click(screen.getByRole('link', { name: 'Check' }));

    expect(updateNodeUrlMock).toHaveBeenCalledWith(CUSTOM_NODE_KEY, mockUrl);
  });

  it('allows connecting to a custom node', () => {
    const mockUrl = 'https://custom.url';
    const updateNodeUrlMock = jest.fn();

    // @ts-ignore Typescript doesn't recognise mocked instances
    useNodes.mockImplementation(mockNodesImplementation(updateNodeUrlMock));

    render(
      <MockedProvider mocks={[statsQueryMock]}>
        <NodeSwitcher config={{ hosts: [] }} onConnect={onConnect} />
      </MockedProvider>
    );

    expect(screen.getByRole('button', { name: 'Connect' })).toHaveAttribute(
      'disabled'
    );

    fireEvent.click(screen.getByRole('radio', { name: 'Other' }));
    expect(screen.getByRole('link', { name: 'Check' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(screen.getByRole('button', { name: 'Connect' })).toHaveAttribute(
      'disabled'
    );

    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: mockUrl,
      },
    });

    expect(screen.getByRole('link', { name: 'Check' })).toHaveAttribute(
      'aria-disabled',
      'false'
    );
    expect(screen.getByRole('button', { name: 'Connect' })).toHaveAttribute(
      'disabled'
    );

    fireEvent.click(screen.getByRole('link', { name: 'Check' }));

    expect(screen.getByRole('button', { name: 'Connect' })).not.toHaveAttribute(
      'disabled'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Connect' }));

    expect(onConnect).toHaveBeenCalledWith(mockUrl);
  });

  it.each`
    dataProp          | state
    ${'responseTime'} | ${STATES.LOADING}
    ${'responseTime'} | ${STATES.HAS_ERROR}
    ${'block'}        | ${STATES.LOADING}
    ${'block'}        | ${STATES.HAS_ERROR}
    ${'chain'}        | ${STATES.LOADING}
    ${'chain'}        | ${STATES.HAS_ERROR}
    ${'ssl'}          | ${STATES.LOADING}
    ${'ssl'}          | ${STATES.HAS_ERROR}
  `(
    'disables selecting a custom node when the $dataProp $state',
    ({ dataProp, state }: { dataProp: NodeDataProp; state: STATES }) => {
      const mockUrl = 'https://custom.url';
      const updateNodeUrlMock = jest.fn();

      // @ts-ignore Typescript doesn't recognise mocked instances
      useNodes.mockImplementation(
        mockNodesImplementation(updateNodeUrlMock, (env) => {
          const nodeState = getValidNodeState(env, mockUrl);
          return {
            ...nodeState,
            [dataProp]: {
              ...nodeState[dataProp],
              isLoading:
                state === STATES.LOADING ? true : nodeState[dataProp].isLoading,
              hasError:
                state === STATES.HAS_ERROR
                  ? true
                  : nodeState[dataProp].hasError,
              value: undefined,
            },
          };
        })
      );

      render(
        <MockedProvider mocks={[statsQueryMock]}>
          <NodeSwitcher config={{ hosts: [] }} onConnect={onConnect} />
        </MockedProvider>
      );

      expect(screen.getByRole('button', { name: 'Connect' })).toHaveAttribute(
        'disabled'
      );

      fireEvent.click(screen.getByRole('radio', { name: 'Other' }));
      expect(screen.getByRole('link', { name: 'Check' })).toHaveAttribute(
        'aria-disabled',
        'true'
      );
      expect(screen.getByRole('button', { name: 'Connect' })).toHaveAttribute(
        'disabled'
      );

      fireEvent.change(screen.getByRole('textbox'), {
        target: {
          value: mockUrl,
        },
      });

      expect(screen.getByRole('link', { name: 'Check' })).toHaveAttribute(
        'aria-disabled',
        'false'
      );
      expect(screen.getByRole('button', { name: 'Connect' })).toHaveAttribute(
        'disabled'
      );

      fireEvent.click(screen.getByRole('link', { name: 'Check' }));

      if (state === STATES.LOADING) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(screen.getByRole('link', { name: 'Checking' })).toHaveAttribute(
          'aria-disabled',
          'true'
        );
      }

      if (state === STATES.HAS_ERROR) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(screen.getByRole('link', { name: 'Check' })).toHaveAttribute(
          'aria-disabled',
          'false'
        );
      }

      expect(screen.getByRole('button', { name: 'Connect' })).toHaveAttribute(
        'disabled'
      );

      if (state === STATES.HAS_ERROR) {
        const expectedErrorType =
          dataProp === 'ssl' ? ErrorType.SSL_ERROR : ErrorType.CONNECTION_ERROR;
        const error = getErrorByType(
          expectedErrorType,
          Networks.TESTNET,
          mockUrl
        );

        // eslint-disable-next-line jest/no-conditional-expect
        expect(error?.headline).not.toBeNull();
        // eslint-disable-next-line jest/no-conditional-expect
        expect(screen.getByText(error?.headline ?? '')).toBeInTheDocument();
      }
    }
  );

  it('disables selecting a custom node when it has an invalid url', () => {
    const mockUrl = 'not-valid-url';
    const updateNodeUrlMock = jest.fn();

    // @ts-ignore Typescript doesn't recognise mocked instances
    useNodes.mockImplementation(mockNodesImplementation(updateNodeUrlMock));

    render(
      <MockedProvider mocks={[statsQueryMock]}>
        <NodeSwitcher config={{ hosts: [] }} onConnect={onConnect} />
      </MockedProvider>
    );

    fireEvent.click(screen.getByRole('radio', { name: 'Other' }));
    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: mockUrl,
      },
    });
    fireEvent.click(screen.getByRole('link', { name: 'Check' }));

    expect(screen.getByRole('button', { name: 'Connect' })).toHaveAttribute(
      'disabled'
    );

    const error = getErrorByType(
      ErrorType.INVALID_URL,
      Networks.TESTNET,
      mockUrl
    );

    expect(error?.headline).not.toBeNull();
    expect(screen.getByText(error?.headline ?? '')).toBeInTheDocument();
  });

  it('disables selecting a custom node when it is on an incorrect network', () => {
    const mockUrl = 'https://mock.url';
    const updateNodeUrlMock = jest.fn();

    // @ts-ignore Typescript doesn't recognise mocked instances
    useNodes.mockImplementation(
      mockNodesImplementation(updateNodeUrlMock, (env, url) => {
        const nodeState = getValidNodeState(env, url);
        return {
          ...nodeState,
          chain: {
            ...nodeState.chain,
            value: 'network-chain-id',
          },
        };
      })
    );

    render(
      <MockedProvider mocks={[statsQueryMock]}>
        <NodeSwitcher config={{ hosts: [] }} onConnect={onConnect} />
      </MockedProvider>
    );

    fireEvent.click(screen.getByRole('radio', { name: 'Other' }));
    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: mockUrl,
      },
    });
    fireEvent.click(screen.getByRole('link', { name: 'Check' }));

    expect(screen.getByRole('button', { name: 'Connect' })).toHaveAttribute(
      'disabled'
    );

    const error = getErrorByType(
      ErrorType.INVALID_NETWORK,
      Networks.TESTNET,
      mockUrl
    );

    expect(error?.headline).not.toBeNull();
    expect(screen.getByText(error?.headline ?? '')).toBeInTheDocument();
  });

  it.each`
    description                                       | errorType
    ${'the node has an invalid url'}                  | ${ErrorType.INVALID_URL}
    ${'the node is on an invalid network'}            | ${ErrorType.INVALID_NETWORK}
    ${'the node has an ssl issue'}                    | ${ErrorType.SSL_ERROR}
    ${'the node cannot be reached'}                   | ${ErrorType.CONNECTION_ERROR}
    ${'none of the config nodes can be connected to'} | ${ErrorType.CONNECTION_ERROR_ALL}
    ${'the config cannot be loaded'}                  | ${ErrorType.CONFIG_LOAD_ERROR}
    ${'the config is invalid'}                        | ${ErrorType.CONFIG_VALIDATION_ERROR}
  `(
    'displays initial error when $description',
    ({ errorType }: { errorType: ErrorType }) => {
      const mockEnvUrl = 'https://mock.url';

      // @ts-ignore Typescript doesn't recognise mocked instances
      useEnvironment.mockImplementation(() => ({
        VEGA_ENV: Networks.TESTNET,
        VEGA_URL: mockEnvUrl,
      }));

      render(
        <NodeSwitcher
          config={{ hosts: HOSTS }}
          initialErrorType={errorType}
          onConnect={onConnect}
        />
      );

      const error = getErrorByType(errorType, Networks.TESTNET, mockEnvUrl);

      expect(error?.headline).not.toBeNull();
      expect(error?.message).not.toBeNull();
      expect(screen.getByText(error?.headline ?? '')).toBeInTheDocument();
      expect(screen.getByText(error?.message ?? '')).toBeInTheDocument();
    }
  );
});

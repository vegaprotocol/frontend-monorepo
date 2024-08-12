import type { ReactNode } from 'react';
import { ApolloProvider } from '@apollo/client';
import { useEnvironment } from '../../hooks';
import { render, screen } from '@testing-library/react';
import { NetworkLoader } from './network-loader';
import { createClient } from '@vegaprotocol/apollo-client';
import { createMockClient } from 'mock-apollo-client';

jest.mock('@apollo/client');
jest.mock('@vegaprotocol/apollo-client');
jest.mock('../../hooks');

// @ts-ignore Typescript doesn't recognise mocked instances
ApolloProvider.mockImplementation(({ children }: { children: ReactNode }) => {
  return children;
});

const SKELETON_TEXT = 'LOADING';
const SUCCESS_TEXT = 'LOADED';

describe('Network loader', () => {
  it('renders a skeleton when there is no vega url in the environment', () => {
    // @ts-ignore Typescript doesn't recognise mocked instances
    useEnvironment.mockImplementation(() => ({
      API_NODE: undefined,
      status: 'success',
    }));

    render(
      <NetworkLoader skeleton={SKELETON_TEXT}>{SUCCESS_TEXT}</NetworkLoader>
    );

    expect(screen.getByText(SKELETON_TEXT)).toBeInTheDocument();
    expect(screen.queryByText(SUCCESS_TEXT)).not.toBeInTheDocument();
    expect(createClient).not.toHaveBeenCalled();
  });

  it('renders the child components wrapped in an apollo provider when the environment has a vega url', async () => {
    // @ts-ignore -- ts does not seem to infer this type correctly
    createClient.mockReturnValueOnce(createMockClient());

    // @ts-ignore Typescript doesn't recognise mocked instances
    useEnvironment.mockImplementation(() => ({
      API_NODE: {
        graphQLApiUrl: 'http://vega.node',
        restApiUrl: 'http://vega.node',
      },
      status: 'success',
    }));

    render(
      <NetworkLoader skeleton={SKELETON_TEXT}>{SUCCESS_TEXT}</NetworkLoader>
    );
    expect(createClient).toHaveBeenCalledWith({
      url: 'http://vega.node',
      cacheConfig: undefined,
    });
    expect(screen.getByText(SUCCESS_TEXT)).toBeInTheDocument();
  });
});

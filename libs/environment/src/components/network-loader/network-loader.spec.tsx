import type { ReactNode } from 'react';
import { ApolloProvider } from '@apollo/client';
import { useEnvironment } from '../../hooks';
import { render, screen } from '@testing-library/react';
import { NetworkLoader } from './network-loader';

jest.mock('@apollo/client');
jest.mock('../../hooks');

// @ts-ignore Typescript doesn't recognise mocked instances
ApolloProvider.mockImplementation(({ children }: { children: ReactNode }) => {
  return children;
});

const SKELETON_TEXT = 'LOADING';
const SUCCESS_TEXT = 'LOADED';

const createClient = jest.fn();

beforeEach(() => {
  createClient.mockReset();
  createClient.mockImplementation(() => {
    return jest.fn();
  });
});

describe('Network loader', () => {
  it('renders a skeleton when there is no vega url in the environment', () => {
    // @ts-ignore Typescript doesn't recognise mocked instances
    useEnvironment.mockImplementation(() => ({
      VEGA_URL: undefined,
    }));

    render(
      <NetworkLoader skeleton={SKELETON_TEXT} createClient={createClient}>
        {SUCCESS_TEXT}
      </NetworkLoader>
    );

    expect(screen.getByText(SKELETON_TEXT)).toBeInTheDocument();
    expect(() => screen.getByText(SUCCESS_TEXT)).toThrow();
    expect(createClient).not.toHaveBeenCalled();
  });

  it('renders the child components wrapped in an apollo provider when the environment has a vega url', () => {
    // @ts-ignore Typescript doesn't recognise mocked instances
    useEnvironment.mockImplementation(() => ({
      VEGA_URL: 'http://vega.node',
    }));

    render(
      <NetworkLoader skeleton={SKELETON_TEXT} createClient={createClient}>
        {SUCCESS_TEXT}
      </NetworkLoader>
    );

    expect(() => screen.getByText(SKELETON_TEXT)).toThrow();
    expect(screen.getByText(SUCCESS_TEXT)).toBeInTheDocument();
    expect(createClient).toHaveBeenCalledWith('http://vega.node');
  });
});

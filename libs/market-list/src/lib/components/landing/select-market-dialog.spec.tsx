import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { SelectMarketDialog } from './select-market-dialog';
import { MockedProvider } from '@apollo/client/testing';

jest.mock(
  'next/link',
  () =>
    ({ children }: { children: ReactNode }) =>
      children
);

jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: '',
      asPath: '',
    };
  },
}));

describe('SelectMarketDialog', () => {
  it('should render select a market dialog', () => {
    render(
      <MockedProvider>
        <SelectMarketDialog dialogOpen={true} setDialogOpen={() => jest.fn()} />
      </MockedProvider>
    );
    expect(screen.getByText('Select a market')).toBeTruthy();
  });
});

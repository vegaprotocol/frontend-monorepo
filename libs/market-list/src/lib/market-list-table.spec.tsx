import { render } from '@testing-library/react';
import { MockedProvider } from '@apollo/react-testing';
import MarketListTable from './market-list-table';

describe('MarketListTable', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <MockedProvider>
        <MarketListTable />
      </MockedProvider>
    );
    expect(baseElement).toBeTruthy();
  });
});

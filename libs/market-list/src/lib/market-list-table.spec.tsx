import { render } from '@testing-library/react';
import { MockedProvider } from '@apollo/react-testing';
import MarketListTable from './market-list-table';

describe('MarketListTable', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <MockedProvider>
        <MarketListTable width={100} height={100} />
      </MockedProvider>
    );
    expect(baseElement).toBeTruthy();
  });
});

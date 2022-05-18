import { render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { MockedProvider } from '@apollo/react-testing';
import MarketListTable from './market-list-table';

describe('MarketListTable', () => {
  it('should render successfully', async () => {
    await act(async () => {
      const { baseElement } = render(
        <MockedProvider>
          <MarketListTable
            data={[]}
            onRowClicked={jest.fn((marketId: string) => {
              //do nothing
            })}
          />
        </MockedProvider>
      );
      expect(baseElement).toBeTruthy();
    });
  });
});

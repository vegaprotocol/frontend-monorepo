import { render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { MockedProvider } from '@apollo/react-testing';
import PositionsTable from './positions-table';

describe('PositionsTable', () => {
  it('should render successfully', async () => {
    await act(async () => {
      const { baseElement } = render(
        <MockedProvider>
          <PositionsTable
            data={[]}
            onRowClicked={(marketId) => {
              console.log(marketId);
            }}
          />
        </MockedProvider>
      );
      expect(baseElement).toBeTruthy();
    });
  });
});

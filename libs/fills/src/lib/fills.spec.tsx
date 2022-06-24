import { render, act } from '@testing-library/react';

import { FillsTable } from './fills-table';

describe('FillsTable', () => {
  it('should render successfully', async () => {
    await act(async () => {
      const { baseElement } = render(
        <FillsTable partyId="party-id" fills={[]} />
      );
      expect(baseElement).toBeTruthy();
    });
  });
});

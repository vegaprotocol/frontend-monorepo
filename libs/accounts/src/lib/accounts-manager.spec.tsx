import { act, render } from '@testing-library/react';
import { AccountManager } from './accounts-manager';

const mockReload = jest.fn();
jest.mock('@vegaprotocol/react-helpers', () => ({
  ...jest.requireActual('@vegaprotocol/react-helpers'),
  useDataProvider: jest.fn(() => ({
    data: [],
    reload: mockReload,
  })),
}));

describe('AccountManager', () => {
  it('change partyId should reload data provider', async () => {
    const { rerender } = render(
      <AccountManager partyId="partyOne" onClickAsset={jest.fn} />
    );
    expect(mockReload).not.toHaveBeenCalled();
    await act(() => {
      rerender(<AccountManager partyId="partyTwo" onClickAsset={jest.fn} />);
    });
    expect(mockReload).toHaveBeenCalledWith(true);
  });
});

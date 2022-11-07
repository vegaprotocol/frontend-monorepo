import { act, render } from '@testing-library/react';
import { AccountManager } from './accounts-manager';
import * as helpers from '@vegaprotocol/react-helpers';

jest.mock('@vegaprotocol/react-helpers', () => ({
  ...jest.requireActual('@vegaprotocol/react-helpers'),
  useDataProvider: jest.fn(() => ({
    data: [],
  })),
}));

describe('AccountManager', () => {
  it('change partyId should reload data provider', async () => {
    const { rerender } = render(
      <AccountManager partyId="partyOne" onClickAsset={jest.fn} />
    );
    expect(
      (helpers.useDataProvider as jest.Mock).mock.calls[0][0].variables.partyId
    ).toEqual('partyOne');
    await act(() => {
      rerender(<AccountManager partyId="partyTwo" onClickAsset={jest.fn} />);
    });
    expect(
      (helpers.useDataProvider as jest.Mock).mock.calls[1][0].variables.partyId
    ).toEqual('partyTwo');
  });
});

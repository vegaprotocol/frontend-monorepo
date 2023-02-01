import { act, render, screen, waitFor } from '@testing-library/react';
import * as helpers from '@vegaprotocol/react-helpers';
import type { AccountFields } from './accounts-data-provider';
import { AccountManager } from './accounts-manager';

let mockedUpdate: ({
  delta,
  data,
}: {
  delta?: never;
  data: AccountFields[] | null;
}) => boolean;
jest.mock('@vegaprotocol/react-helpers', () => ({
  ...jest.requireActual('@vegaprotocol/react-helpers'),
  useDataProvider: jest.fn((args) => {
    mockedUpdate = args.update;
    return {
      data: [],
    };
  }),
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

  it('update method should return proper result', async () => {
    await act(() => {
      render(<AccountManager partyId="partyOne" onClickAsset={jest.fn} />);
    });
    await waitFor(() => {
      expect(screen.getByText('No accounts')).toBeInTheDocument();
    });
    await act(() => {
      expect(mockedUpdate({ data: [] })).toEqual(true);

      expect(
        mockedUpdate({ data: [{ party: { id: 't1' } }] as AccountFields[] })
      ).toEqual(false);
      expect(
        mockedUpdate({ data: [{ party: { id: 't2' } }] as AccountFields[] })
      ).toEqual(true);
      expect(mockedUpdate({ data: [] })).toEqual(false);
      expect(mockedUpdate({ data: [] })).toEqual(true);
    });
  });
});

import {
  act,
  getAllByRole,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import * as helpers from '@vegaprotocol/react-helpers';
import { AccountManager } from './accounts-manager';

const mockedUseDataProvider = jest.fn();
jest.mock('@vegaprotocol/react-helpers', () => ({
  ...jest.requireActual('@vegaprotocol/react-helpers'),
  useDataProvider: jest.fn(() => mockedUseDataProvider()),
}));

describe('AccountManager', () => {
  beforeEach(() => {
    mockedUseDataProvider
      .mockImplementationOnce((args) => {
        return {
          data: [],
        };
      })
      .mockImplementationOnce((args) => {
        return {
          data: [
            { asset: { id: 'a1' }, party: { id: 't1' } },
            { asset: { id: 'a2' }, party: { id: 't2' } },
          ],
        };
      });
  });

  it('change partyId should reload data provider', async () => {
    const { rerender } = render(
      <AccountManager
        partyId="partyOne"
        onClickAsset={jest.fn}
        isReadOnly={false}
      />
    );
    expect(
      (helpers.useDataProvider as jest.Mock).mock.calls[0][0].variables.partyId
    ).toEqual('partyOne');
    await act(() => {
      rerender(
        <AccountManager
          partyId="partyTwo"
          onClickAsset={jest.fn}
          isReadOnly={false}
        />
      );
    });
    expect(
      (helpers.useDataProvider as jest.Mock).mock.calls[1][0].variables.partyId
    ).toEqual('partyTwo');
  });

  it('update method should return proper result', async () => {
    let rerenderer: (ui: React.ReactElement) => void;
    await act(() => {
      const { rerender } = render(
        <AccountManager
          partyId="partyOne"
          onClickAsset={jest.fn}
          isReadOnly={false}
        />
      );
      rerenderer = rerender;
    });
    await waitFor(() => {
      expect(screen.getByText('No accounts')).toBeInTheDocument();
    });
    await act(() => {
      rerenderer(
        <AccountManager
          partyId="partyOne"
          onClickAsset={jest.fn}
          isReadOnly={false}
        />
      );
    });

    const container = document.querySelector('.ag-center-cols-container');
    await waitFor(() => {
      expect(container).toBeInTheDocument();
    });
    expect(getAllByRole(container as HTMLDivElement, 'row')).toHaveLength(2);
  });
});

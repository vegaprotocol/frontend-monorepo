import {
  act,
  getAllByRole,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import * as helpers from '@vegaprotocol/data-provider';
import { AccountManager } from './accounts-manager';

const mockedUseDataProvider = jest.fn();
jest.mock('@vegaprotocol/data-provider', () => ({
  ...jest.requireActual('@vegaprotocol/data-provider'),
  useDataProvider: jest.fn(() => mockedUseDataProvider()),
}));

describe('AccountManager', () => {
  describe('when rerender', () => {
    beforeEach(() => {
      mockedUseDataProvider
        .mockImplementationOnce((args) => {
          return {
            data: [],
          };
        })
        .mockImplementation((args) => {
          return {
            data: [
              { asset: { id: 'a1' }, party: { id: 't1' } },
              { asset: { id: 'a2' }, party: { id: 't2' } },
            ],
          };
        });
    });

    afterEach(() => {
      jest.clearAllMocks();
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
        (helpers.useDataProvider as jest.Mock).mock.calls[0][0].variables
          .partyId
      ).toEqual('partyOne');
      await act(async () => {
        rerender(
          <AccountManager
            partyId="partyTwo"
            onClickAsset={jest.fn}
            isReadOnly={false}
          />
        );
      });
      expect(
        (helpers.useDataProvider as jest.Mock).mock.calls[1][0].variables
          .partyId
      ).toEqual('partyTwo');
    });

    it('update method should return proper result', async () => {
      let rerenderer: (ui: React.ReactElement) => void;
      await act(async () => {
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
      await act(async () => {
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

  it('loading should be displayed', async () => {
    mockedUseDataProvider.mockImplementation((args) => {
      return {
        loading: true,
        data: null,
      };
    });
    await act(() => {
      render(
        <AccountManager
          partyId="partyOne"
          onClickAsset={jest.fn}
          isReadOnly={false}
        />
      );
    });
    expect(await screen.findByTestId('datagrid-loading')).toBeInTheDocument();
  });
});

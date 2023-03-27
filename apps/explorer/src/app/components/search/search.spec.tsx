import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { SearchForm } from './search';
import { MemoryRouter } from 'react-router-dom';
import { Routes } from '../../routes/route-names';

global.fetch = jest.fn();
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

beforeEach(() => {
  mockedNavigate.mockClear();
});

const renderComponent = () =>
  render(
    <MemoryRouter>
      <SearchForm />
    </MemoryRouter>
  );

describe('SearchForm', () => {
  it('should render search input and button', () => {
    renderComponent();
    expect(screen.getByTestId('search')).toBeInTheDocument();
    expect(screen.getByTestId('search-button')).toHaveTextContent('Search');
  });

  it.each([
    [
      Routes.TX,
      '0000000000000000000000000000000000000000000000000000000000000000',
    ],
    [
      Routes.PARTIES,
      '0000000000000000000000000000000000000000000000000000000000000001',
    ],
    [Routes.BLOCKS, '123'],
    [undefined, 'something else'],
  ])('should redirect to %s', async (route, input) => {
    // @ts-ignore issue related to polyfill
    fetch.mockImplementation(
      jest.fn(() =>
        Promise.resolve({
          ok:
            input ===
            '0000000000000000000000000000000000000000000000000000000000000000',
          json: () =>
            Promise.resolve({
              transaction: {
                hash: input,
              },
            }),
        })
      )
    );
    renderComponent();
    await act(async () => {
      fireEvent.change(screen.getByTestId('search'), {
        target: {
          value: input,
        },
      });
      fireEvent.click(screen.getByTestId('search-button'));
    });
    await waitFor(() => {
      expect(mockedNavigate).toBeCalledTimes(route ? 1 : 0);
      if (route) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(mockedNavigate).toBeCalledWith(`${route}/${input}`);
      }
    });
  });
});

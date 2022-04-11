import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Search } from './search';
import { MemoryRouter } from 'react-router-dom';
import { Routes } from '../../routes/route-names';

const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

beforeEach(() => {
  mockedNavigate.mockClear();
});

const renderComponent = () => (
  <MemoryRouter>
    <Search />
  </MemoryRouter>
);

const getInputs = () => ({
  input: screen.getByTestId('search'),
  button: screen.getByTestId('search-button'),
});

describe('Search', () => {
  it('should render search input and button', () => {
    render(renderComponent());
    expect(screen.getByTestId('search')).toBeInTheDocument();
    expect(screen.getByTestId('search-button')).toHaveTextContent('Search');
  });

  it('should render error if input is not known', async () => {
    render(renderComponent());
    const { button, input } = getInputs();
    fireEvent.change(input, { target: { value: 'asd' } });
    fireEvent.click(button);

    expect(await screen.findByTestId('search-error')).toHaveTextContent(
      "Something doesn't look right"
    );
  });
  it('should render error if no input is given', async () => {
    render(renderComponent());
    const { button } = getInputs();

    fireEvent.click(button);

    expect(await screen.findByTestId('search-error')).toHaveTextContent(
      'Search required'
    );
  });

  it('should render error if transaction is not hex', async () => {
    render(renderComponent());
    const { button, input } = getInputs();
    fireEvent.change(input, {
      target: {
        value:
          '0x123456789012345678901234567890123456789012345678901234567890123Q',
      },
    });

    fireEvent.click(button);

    expect(await screen.findByTestId('search-error')).toHaveTextContent(
      'Transaction is not hexadecimal'
    );
  });

  it('should render error if transaction is not hex and does not have leading 0x', async () => {
    render(renderComponent());
    const { button, input } = getInputs();
    fireEvent.change(input, {
      target: {
        value:
          '123456789012345678901234567890123456789012345678901234567890123Q',
      },
    });

    fireEvent.click(button);

    expect(await screen.findByTestId('search-error')).toHaveTextContent(
      'Transaction is not hexadecimal'
    );
  });

  it('should redirect to transactions page', async () => {
    render(renderComponent());
    const { button, input } = getInputs();
    fireEvent.change(input, {
      target: {
        value:
          '0x1234567890123456789012345678901234567890123456789012345678901234',
      },
    });

    fireEvent.click(button);
    await waitFor(() => {
      expect(mockedNavigate).toBeCalledWith(
        `${Routes.TX}/0x1234567890123456789012345678901234567890123456789012345678901234`
      );
    });
  });

  it('should redirect to transactions page without proceeding 0x', async () => {
    render(renderComponent());
    const { button, input } = getInputs();
    fireEvent.change(input, {
      target: {
        value:
          '1234567890123456789012345678901234567890123456789012345678901234',
      },
    });

    fireEvent.click(button);
    await waitFor(() => {
      expect(mockedNavigate).toBeCalledWith(
        `${Routes.TX}/0x1234567890123456789012345678901234567890123456789012345678901234`
      );
    });
  });

  it('should redirect to blocks page if passed a number', async () => {
    render(renderComponent());
    const { button, input } = getInputs();
    fireEvent.change(input, {
      target: {
        value: '123',
      },
    });

    fireEvent.click(button);
    await waitFor(() => {
      expect(mockedNavigate).toBeCalledWith(`${Routes.BLOCKS}/123`);
    });
  });
});

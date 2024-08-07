import { fireEvent, render, screen } from '@testing-library/react';

import componentLocators from '../../locators';
import { ErrorModal, locators } from '.';

describe('ErrorModal', () => {
  const error = new Error('Test error');
  const onCloseMock = jest.fn();

  it('renders error message', () => {
    render(<ErrorModal error={error} onClose={onCloseMock} />);
    const errorMessage = screen.getByTestId(
      componentLocators.codeWindowContent
    );
    expect(errorMessage).toBeVisible();
    const title = screen.getByText("Something's gone wrong");
    expect(title).toBeVisible();
  });

  it('renders generic error message is error is null', () => {
    render(<ErrorModal error={null} onClose={onCloseMock} />);
    const errorMessage = screen.getByTestId(
      componentLocators.codeWindowContent
    );
    expect(errorMessage).toBeVisible();
    const title = screen.getByText("Something's gone wrong");
    expect(title).toBeVisible();
    expect(screen.getByText('An unknown error occurred')).toBeVisible();
  });

  it('calls onClose when Close button is clicked', () => {
    render(<ErrorModal error={error} onClose={onCloseMock} />);
    const closeButton = screen.getByTestId(locators.errorModalClose);
    fireEvent.click(closeButton);
    expect(onCloseMock).toHaveBeenCalled();
  });
});

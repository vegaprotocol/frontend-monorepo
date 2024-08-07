import { fireEvent, render, screen } from '@testing-library/react';

import { SignedMessage } from './signed-message';

describe('SignedMessage', () => {
  it('should render the message correctly', () => {
    const message = 'Hello, world!';
    render(<SignedMessage onClick={() => {}} message={message} />);

    const messageElement = screen.getByText(message);
    expect(messageElement).toBeInTheDocument();
  });

  it('should call the onClick callback when the "Done" button is clicked', () => {
    const onClickMock = jest.fn();
    render(<SignedMessage onClick={onClickMock} message="" />);

    const buttonElement = screen.getByText('Done');
    fireEvent.click(buttonElement);

    expect(onClickMock).toHaveBeenCalled();
  });
});

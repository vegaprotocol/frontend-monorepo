import { render, screen } from '@testing-library/react';
import { StatusMessage } from './index';

describe('Status message', () => {
  it('should render successfully', () => {
    render(
      <StatusMessage data-testid="status-message-test">test</StatusMessage>
    );
    expect(screen.getByTestId('status-message-test')).toBeInTheDocument();
  });
});

import { fireEvent, render, screen } from '@testing-library/react';
import { useEffect } from 'react';

import { locators as subHeaderLocators } from '@/components/sub-header';
import { silenceErrors } from '@/test-helpers/silence-errors';

import locators from '../../locators';
import { ReceiptViewErrorBoundary } from './receipt-error-boundary';

// Mock the Sentry captureException function
// jest.mock('@sentry/browser', () => ({
//   captureException: jest.fn()
// }))

const BrokenComponent = ({ error }: { error: Error }) => {
  useEffect(() => {
    throw error;
  }, [error]);
  return <div data-testid="successful-render" />;
};

describe('ReceiptViewErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ReceiptViewErrorBoundary>
        <div data-testid="child-content">Child content</div>
      </ReceiptViewErrorBoundary>
    );

    const childContent = screen.getByTestId('child-content');
    expect(childContent).toBeInTheDocument();
  });

  it('renders an error message when an error occurs', () => {
    silenceErrors();
    const error = new Error('Test error message');

    render(
      <ReceiptViewErrorBoundary>
        <BrokenComponent error={error} />
      </ReceiptViewErrorBoundary>
    );
    // Verify that the error message is displayed
    const errorMessage = screen.getByText(
      "Your transaction receipt can't be shown. You can still view the raw transaction JSON below."
    );
    expect(errorMessage).toBeInTheDocument();

    expect(screen.getByTestId(subHeaderLocators.subHeader)).toHaveTextContent(
      'Error details'
    );

    fireEvent.click(screen.getByTestId(locators.collapsiblePanelButton));
    const errorStack = screen.getByTestId(locators.collapsiblePanelContent);
    expect(errorStack).toHaveTextContent(error.message);
  });

  it('renders an error message when an error occurs if stack is undefined', () => {
    silenceErrors();
    const error = new Error('Test error message');
    error.stack = undefined;

    render(
      <ReceiptViewErrorBoundary>
        <BrokenComponent error={error} />
      </ReceiptViewErrorBoundary>
    );
    // Verify that the error message is displayed
    const errorMessage = screen.getByText(
      "Your transaction receipt can't be shown. You can still view the raw transaction JSON below."
    );
    expect(errorMessage).toBeInTheDocument();

    expect(screen.getByTestId(subHeaderLocators.subHeader)).toHaveTextContent(
      'Error details'
    );

    fireEvent.click(screen.getByTestId(locators.collapsiblePanelButton));
    const errorStack = screen.getByTestId(locators.collapsiblePanelContent);
    expect(errorStack).toHaveTextContent(error.message);
  });
});

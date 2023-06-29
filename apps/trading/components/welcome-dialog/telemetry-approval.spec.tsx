import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TelemetryApproval } from './telemetry-approval';

jest.mock('@vegaprotocol/logger', () => ({
  SentryInit: () => undefined,
  SentryClose: () => undefined,
}));

jest.mock('@vegaprotocol/environment', () => ({
  useEnvironment: () => ({ VEGA_ENV: 'test', SENTRY_DSN: 'sentry-dsn' }),
}));

describe('TelemetryApproval', () => {
  it('click on checkbox should be properly handled', async () => {
    const helpText = 'My help text';
    render(<TelemetryApproval helpText={helpText} />);
    expect(screen.getByRole('checkbox')).toHaveAttribute(
      'data-state',
      'unchecked'
    );
    await userEvent.click(screen.getByRole('checkbox'));
    expect(screen.getByRole('checkbox')).toHaveAttribute(
      'data-state',
      'checked'
    );
    expect(screen.getByText('Share usage data')).toBeInTheDocument();
    expect(screen.getByText(helpText)).toBeInTheDocument();
  });
});

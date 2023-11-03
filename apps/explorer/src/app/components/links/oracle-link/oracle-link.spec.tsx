import OracleLink, { getStatusString } from './oracle-link';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';

describe('getStatusString', () => {
  it("returns 'Unknown' for undefined status", () => {
    expect(getStatusString(undefined)).toBe('Unknown');
  });

  it('returns the correct string for a known status', () => {
    expect(getStatusString('STATUS_ACTIVE')).toBe('Active');
    expect(getStatusString('STATUS_DEACTIVATED')).toBe('Deactivated');
  });
});

describe('OracleLink', () => {
  it('renders the truncated Oracle ID', () => {
    const id = '123456789';
    render(
      <MockedProvider>
        <MemoryRouter>
          <OracleLink id={id} />
        </MemoryRouter>
      </MockedProvider>
    );
    const idElement = screen.getByText(id.slice(0, 6));
    expect(idElement).toBeInTheDocument();
    expect(idElement).toHaveAttribute('title', id);
  });

  it('renders the Oracle status', () => {
    const id = '123';
    const status = 'STATUS_ACTIVE';
    render(
      <MockedProvider>
        <MemoryRouter>
          <OracleLink id={id} status={status} data-testid="link" />
        </MemoryRouter>
      </MockedProvider>
    );
    expect(screen.getByTestId('link')).toHaveAttribute('data-status', 'Active');
  });

  it('renders the Oracle data indicator', () => {
    const id = '123';
    const hasSeenOracleReports = true;
    render(
      <MockedProvider>
        <MemoryRouter>
          <OracleLink id={id} hasSeenOracleReports={hasSeenOracleReports} />
        </MemoryRouter>
      </MockedProvider>
    );
    expect(screen.getByTestId('oracle-data-indicator')).toBeInTheDocument();
  });
});

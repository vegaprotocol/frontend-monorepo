import OracleLink, {
  getStatusString,
  type OracleLinkProps,
} from './oracle-link';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { TooltipProvider } from '@vegaprotocol/ui-toolkit';

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
  const renderComponent = (props: OracleLinkProps) => {
    return render(
      <MockedProvider>
        <MemoryRouter>
          <TooltipProvider>
            <OracleLink {...props} />
          </TooltipProvider>
        </MemoryRouter>
      </MockedProvider>
    );
  };
  it('renders the truncated Oracle ID', () => {
    const id = '123456789';
    renderComponent({ id });
    const idElement = screen.getByText(id.slice(0, 8));
    expect(idElement).toBeInTheDocument();
    expect(idElement).toHaveAttribute('title', id);
  });

  it('renders the Oracle status', () => {
    const id = '123';
    const status = 'STATUS_ACTIVE';
    // @ts-ignore link allows for data-testid
    renderComponent({ id, status, 'data-testid': 'link' });
    expect(screen.getByTestId('link')).toHaveAttribute('data-status', 'Active');
  });

  it('renders the Oracle data indicator', () => {
    const id = '123';
    const hasSeenOracleReports = true;
    renderComponent({
      id,
      hasSeenOracleReports,
    });
    expect(screen.getByTestId('oracle-data-indicator')).toBeInTheDocument();
  });
});

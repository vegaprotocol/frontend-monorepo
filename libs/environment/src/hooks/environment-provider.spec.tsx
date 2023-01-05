import { act, render, screen, waitFor } from '@testing-library/react';
import { Networks } from '../types';
import { EnvironmentProvider } from './use-environment';

describe('EnvironmentProvider', () => {
  beforeAll(() => {
    process.env['NX_MAINTENANCE_PAGE'] = 'true';
    process.env['NX_VEGA_URL'] = 'https://vega.xyz';
    process.env['NX_VEGA_ENV'] = Networks.TESTNET;
  });
  afterAll(() => {
    process.env['NX_MAINTENANCE_PAGE'] = '';
  });
  it('EnvironmentProvider should return maintenance page', async () => {
    await act(async () => {
      render(<EnvironmentProvider />);
    });
    await waitFor(() => {
      expect(screen.getByTestId('maintenance-page')).toBeInTheDocument();
    });
  });
});

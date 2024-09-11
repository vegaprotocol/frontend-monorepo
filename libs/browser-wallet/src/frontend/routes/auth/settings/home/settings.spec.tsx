import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { JsonRPCProvider } from '@/contexts/json-rpc/json-rpc-provider';
import { useGlobalsStore } from '@/stores/globals';
import { mockClient } from '@/test-helpers/mock-client';
import { mockStore } from '@/test-helpers/mock-store';

import { locators, Settings } from './settings';

jest.mock('@/stores/globals');
jest.mock('./sections/delete-wallet-section', () => ({
  DeleteWallet: () => <div data-testid="delete-wallet-section" />,
}));
jest.mock('./sections/lock-section', () => ({
  LockSection: () => <div data-testid="lock-section" />,
}));
jest.mock('./sections/export-recovery-phrase-section', () => ({
  ExportRecoveryPhraseSection: () => (
    <div data-testid="export-recovery-phrase-section" />
  ),
}));

const renderComponent = () =>
  render(
    <MemoryRouter>
      <JsonRPCProvider>
        <Settings />
      </JsonRPCProvider>
    </MemoryRouter>
  );

describe('Settings', () => {
  it('renders settings page', () => {
    mockStore(useGlobalsStore, { isMobile: false });
    // 1107-SETT-007 I can see the version # of the browser extension
    // 1107-SETT-008 I can see the feedback link
    // 1107-SETT-013 I can see the delete wallet button
    mockClient();
    renderComponent();
    expect(screen.getByTestId(locators.settingsPage)).toBeVisible();
    // expect(screen.getByTestId('lock-section')).toBeVisible();
    expect(screen.getByTestId('delete-wallet-section')).toBeVisible();
    expect(screen.getByTestId('export-recovery-phrase-section')).toBeVisible();
  });
});

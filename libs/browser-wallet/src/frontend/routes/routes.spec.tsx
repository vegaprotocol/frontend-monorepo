import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { usePersistLocation } from '@/hooks/persist-location';

import { Routing } from './routes';

jest.mock('@/hooks/persist-location');

jest.mock('./auth');
jest.mock('./auth/settings/home');
jest.mock('./auth/wallets');
jest.mock('./auth/wallets/home');
jest.mock('./auth/wallets/key-details');
jest.mock('./home');
jest.mock('./login');
jest.mock('./onboarding/create-password');
jest.mock('./onboarding/create-wallet');
jest.mock('./onboarding/get-started');
jest.mock('./onboarding/import-wallet');
jest.mock('./onboarding/save-mnemonic');

jest.mock('./auth/transactions');

describe('Routes', () => {
  it('calls persist location', () => {
    render(
      <MemoryRouter>
        <Routing />
      </MemoryRouter>
    );
    expect(usePersistLocation).toHaveBeenCalled();
  });
});

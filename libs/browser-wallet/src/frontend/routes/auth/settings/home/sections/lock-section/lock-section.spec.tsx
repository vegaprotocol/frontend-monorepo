import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { RpcMethods } from '@/lib/client-rpc-methods';

import { FULL_ROUTES } from '../../../../../route-names';
import { locators, LockSection } from './lock-section';

const mockRequest = jest.fn();
const mockNavigate = jest.fn();
jest.mock('@/contexts/json-rpc/json-rpc-context', () => ({
  useJsonRpcClient: () => ({
    request: mockRequest,
  }),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderComponent = () =>
  render(
    <MemoryRouter>
      <LockSection />
    </MemoryRouter>
  );

describe('LockSection', () => {
  it('renders lock button', () => {
    renderComponent();
    const lockButton = screen.getByTestId(locators.settingsLockButton);
    expect(lockButton).toBeInTheDocument();
    expect(lockButton).toHaveTextContent('Lock');
  });

  it('calls lock function on form submission', async () => {
    renderComponent();
    const lockButton = screen.getByTestId(locators.settingsLockButton);
    fireEvent.click(lockButton);

    await waitFor(() =>
      expect(mockRequest).toHaveBeenCalledWith(RpcMethods.Lock, null)
    );
    expect(mockNavigate).toHaveBeenCalledWith(FULL_ROUTES.login);
  });
});

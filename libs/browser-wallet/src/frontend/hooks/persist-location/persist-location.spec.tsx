import { renderHook } from '@testing-library/react';
import { type ReactNode, useEffect } from 'react';
import { MemoryRouter, useNavigate } from 'react-router-dom';

import { previousLocation, setPreviousLocation, usePersistLocation } from '.';

describe('PersistLocation', () => {
  beforeEach(() => {
    setPreviousLocation(null);
  });
  it('sets the current location in local storage', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MemoryRouter initialEntries={['/foo']}>{children}</MemoryRouter>
    );
    let initialRoute: string | null = null;
    let secondRoute = null;
    renderHook(
      () => {
        const navigate = useNavigate();
        usePersistLocation();
        if (!initialRoute) {
          initialRoute = previousLocation;
        }
        useEffect(() => {
          navigate('/bar');
        }, [navigate]);

        secondRoute = previousLocation;
      },
      { wrapper }
    );
    // Sets the route initially
    expect(secondRoute).toBe('/bar');
    // Sets the route after navigation
    expect(initialRoute).toBe('/foo');
  });
  it('ignores the home page', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MemoryRouter initialEntries={['/']}>{children}</MemoryRouter>
    );
    let initialRoute: string | null = null;
    renderHook(
      () => {
        usePersistLocation();
        initialRoute = previousLocation;
      },
      { wrapper }
    );
    expect(initialRoute).toBeNull();
  });
});

import { renderHook } from '@testing-library/react';
import { ReactNode, useEffect } from 'react';
import { MemoryRouter, useNavigate } from 'react-router-dom';

import { LOCATION_KEY, usePersistLocation } from '.';

describe('PersistLocation', () => {
  beforeEach(() => {
    localStorage.clear();
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
          initialRoute = localStorage.getItem(LOCATION_KEY);
        }
        useEffect(() => {
          navigate('/bar');
        }, [navigate]);

        secondRoute = localStorage.getItem(LOCATION_KEY);
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
        initialRoute = localStorage.getItem(LOCATION_KEY);
      },
      { wrapper }
    );
    expect(initialRoute).toBeNull();
  });
});

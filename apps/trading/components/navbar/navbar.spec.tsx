import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import type { VegaWalletContextShape } from '@vegaprotocol/wallet';
import { VegaWalletContext } from '@vegaprotocol/wallet';
import { Navbar } from './navbar';

describe('Navbar', () => {
  const pubKey = 'pubKey';
  it('should be properly rendered', () => {
    render(
      <MockedProvider>
        <MemoryRouter>
          <VegaWalletContext.Provider
            value={{ pubKey } as VegaWalletContextShape}
          >
            <Navbar theme="dark" />
          </VegaWalletContext.Provider>
        </MemoryRouter>
      </MockedProvider>
    );
    expect(screen.getByTestId('Markets')).toBeInTheDocument();
    expect(screen.getByTestId('Trading')).toBeInTheDocument();
    expect(screen.getByTestId('Portfolio')).toBeInTheDocument();
  });

  it('Markets page route should not match empty market page', () => {
    render(
      <MockedProvider>
        <MemoryRouter initialEntries={['/markets/all']}>
          <VegaWalletContext.Provider
            value={{ pubKey } as VegaWalletContextShape}
          >
            <Navbar theme="dark" />
          </VegaWalletContext.Provider>
        </MemoryRouter>
      </MockedProvider>
    );
    expect(screen.getByTestId('Markets')).toHaveClass('active');
    expect(screen.getByTestId('Trading')).not.toHaveClass('active');
  });
});

import { render } from '@testing-library/react';
import { OpenOraclePrices } from './open-oracle-prices';
import type { Price } from './open-oracle-prices';

describe('OpenOraclePrices', () => {
  it('Will not render with no prices', () => {
    const p = undefined as unknown as Price;
    const m: string[] = [];
    const s: string[] = [];
    const screen = render(
      <OpenOraclePrices prices={p} messages={m} signatures={s} />
    );
    expect(screen.container).toBeEmptyDOMElement();
  });

  it('Will not render with no messages', () => {
    const m = undefined as unknown as string[];
    const p: Price = {};
    const s: string[] = [];
    const screen = render(
      <OpenOraclePrices prices={p} messages={m} signatures={s} />
    );
    expect(screen.container).toBeEmptyDOMElement();
  });

  it('will not render with no signatures', () => {
    const s = undefined as unknown as string[];
    const m: string[] = [];
    const p: Price = {};
    const screen = render(
      <OpenOraclePrices prices={p} messages={m} signatures={s} />
    );
    expect(screen.container).toBeEmptyDOMElement();
  });

  it('will not render with mismatched prices/signatures', () => {
    const p: Price = { ETH: '123' };
    const m = ['0x123', '0x456'];
    const s: string[] = [];
    const screen = render(
      <OpenOraclePrices prices={p} messages={m} signatures={s} />
    );
    expect(screen.container).toBeEmptyDOMElement();
  });

  it('will not render with mismatched signatures and messages', () => {
    const p: Price = { ETH: '123', BTC: '12' };
    const s = ['0xcac', '0xb33f'];
    const m = ['0x1204o42c', '0xb3ddd3f', '0x9999'];

    const screen = render(
      <OpenOraclePrices prices={p} messages={m} signatures={s} />
    );
    expect(screen.container).toBeEmptyDOMElement();
  });

  it('renders a table when there are prices and signatures and messages', () => {
    const p: Price = { ETH: '123', BTC: '12' };
    const s = ['0xcac', '0xb33f'];
    const m = ['0x120442c', '0xb3ddd3f'];

    const screen = render(
      <OpenOraclePrices prices={p} messages={m} signatures={s} />
    );
    expect(screen.getByTestId('openoracleprices')).toBeInTheDocument();

    // Table headings
    expect(screen.getByText('Asset')).toBeInTheDocument();
    expect(screen.getByText('Price')).toBeInTheDocument();
    expect(screen.getByText('Signature')).toBeInTheDocument();
    expect(screen.getByText('Message')).toBeInTheDocument();
    // Disabled - see vegaprotocol/frontend-monorepo#/2726
    // expect(screen.getByText('Signer')).toBeInTheDocument();

    // One row per asset
    expect(screen.getByText('ETH')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
    expect(screen.getByText('0xcac')).toBeInTheDocument();
    expect(screen.getByText('0xb33f')).toBeInTheDocument();
    // Does not test signer element for this row

    expect(screen.getByText('BTC')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('0x120442c')).toBeInTheDocument();
    expect(screen.getByText('0xb3ddd3f')).toBeInTheDocument();
    // Does not test signer element for this row
  });
});

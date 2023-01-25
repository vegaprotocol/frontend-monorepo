import { render } from '@testing-library/react';
import {
  getAddressFromMessageAndSignature,
  OpenOraclePrice,
  OpenOraclePrices,
} from './open-oracle-prices';
import type { Price } from './open-oracle-prices';

const COINBASE_SIGNER = '0xfCEAdAFab14d46e20144F48824d0C09B1a03F2BC';

const mocks = [
  {
    m: '0x00000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000063ce7fe400000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000278148000000000000000000000000000000000000000000000000000000000000000670726963657300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003534e580000000000000000000000000000000000000000000000000000000000',
    s: '0x57cbbfdf17ff02ccbebd5c1bb6d28d708869615a9764c11d0572804acfcd4fb0dbfa671da836480a738281e915920a18320ea3db86aaa2510888d1d14c00dc85000000000000000000000000000000000000000000000000000000000000001b',
  },
  {
    m: '0x00000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000063ce805c00000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000616ec7900000000000000000000000000000000000000000000000000000000000000006707269636573000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000034554480000000000000000000000000000000000000000000000000000000000',
    s: '0x3e232a135577f0329391b8cbc8bd90adc083a9ee9932cdb34728338af65c98c73c3394830a35b03e1d75883bc8c2d6a5c04d27d386efff1a876db343075ba8f3000000000000000000000000000000000000000000000000000000000000001b',
  },
];

// Disabled - see vegaprotocol/frontend-monorepo#/2726
describe.skip('getAddressFromMessageAndSigner', () => {
  it('returns the known signer from message 1', () => {
    const { m, s } = mocks[0];
    const res = getAddressFromMessageAndSignature(m, s);

    expect(res).toEqual(COINBASE_SIGNER);
  });

  it('returns the known signer from message 2', () => {
    const { m, s } = mocks[1];
    const res = getAddressFromMessageAndSignature(m, s);

    expect(res).toEqual(COINBASE_SIGNER);
  });

  it('returns - if the message is not hex', () => {
    const m = 'ZZcafe';
    const { s } = mocks[1];
    const res = getAddressFromMessageAndSignature(m, s);

    expect(res).toEqual('-');
  });

  it('returns - if it fails to decode due to invalid signature', () => {
    const { m } = mocks[0];
    const s = 'not-even-hex';
    const res = getAddressFromMessageAndSignature(m, s);

    expect(res).toEqual('-');
  });
});

describe('OpenOraclePrice', () => {
  // Disabled - see vegaprotocol/frontend-monorepo#/2726
  it.skip('renders a basic table row with the correct signer', () => {
    const truncatedCoinbaseSigner =
      COINBASE_SIGNER.slice(0, 5) + '…' + COINBASE_SIGNER.slice(-5);
    const { m, s } = mocks[1];
    const screen = render(
      <table>
        <tbody>
          <OpenOraclePrice asset="ETH" value="123" signature={s} message={m} />
        </tbody>
      </table>
    );

    expect(screen.getByText('ETH')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
    expect(screen.getByText('0x000…00000')).toBeInTheDocument();
    expect(screen.getByText('0xfCE…3F2BC')).toBeInTheDocument();

    expect(screen.getByText(truncatedCoinbaseSigner)).toBeInTheDocument();
  });

  // Disabled - see vegaprotocol/frontend-monorepo#/2726
  it.skip('renders a basic table row, with a - if the signer could not be determined', () => {
    const { m } = mocks[1];
    const screen = render(
      <table>
        <tbody>
          <OpenOraclePrice
            asset="ETH"
            value="123"
            signature="bad-signature"
            message={m}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText('ETH')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
    expect(screen.getByText('bad-s…ature')).toBeInTheDocument();
    expect(screen.getByText('0x000…00000')).toBeInTheDocument();

    expect(screen.getByText('-')).toBeInTheDocument();
  });
});

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

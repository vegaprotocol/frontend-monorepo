import { render } from '@testing-library/react';
import { OpenOracleData, parseData } from './data-submission-open-oracle';

describe('OpenOracleData', () => {
  it('renders a table if there is data', () => {
    const p =
      'eyJtZXNzYWdlcyI6IFsiMHgwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDgwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDA2M2M3ZTMwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwYzAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwNGYxZjM4ZWEwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwNjcwNzI2OTYzNjU3MzAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAzNDI1NDQzMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMCJdLCAicHJpY2VzIjogeyJFVEgiOiIxMjMifSwgInNpZ25hdHVyZXMiOiBbIjB4N2U0Nzc2OWEyNzI5NzIwN2Q5ZTIyMmM3YTY2YjBlYzk3Njg4MWY3NmVkYjg5OGFhYzQ5OTRlZWYwOTc4MmI3NGUxMGE5MTJmZWQ1Y2E3NmFlN2U3NzVjOWZiOTBjZGE4ZjhkMDhlNzUyOTE1NzQ2ZTY2OGE1ZWM3OWRmOTZmNmQwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDFjIl0sICJ0aW1lc3RhbXAiOiAiMTIzIn0=';

    const screen = render(<OpenOracleData payload={p} />);
    expect(screen.getByTestId('decoded-payload')).toBeInTheDocument();
    expect(screen.getByText('ETH')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
  });

  it('renders an error if decoding fails', () => {
    const p = 'not-encoded';
    const screen = render(<OpenOracleData payload={p} />);

    expect(
      screen.getByText('Awaiting Block Explorer transaction details')
    ).toBeInTheDocument();
  });
});

describe('Parse Open oracle data', () => {
  it('returns null for an invalid b64 string', () => {
    expect(parseData('🤷')).toBeNull();
  });

  it('returns null for a string that looks like an object', () => {
    expect(parseData('{}')).toBeNull();
  });

  it('returns null for null', () => {
    expect(parseData(null as unknown as string)).toBeNull();
  });

  it('returns a string for b64 encoded data', () => {
    const res = parseData('dGVzdCA9IHRydWU=');
    expect(res).toBeNull();
  });

  it('returns null if the parsed object does not look like te right shape', () => {
    // Encoded: {"test":true}
    const res = parseData('eyJ0ZXN0Ijp0cnVlfQ==');
    expect(res).toBeNull();
  });

  it('returns an object if the payload parses and looks fine', () => {
    // Encoded: {"messages": [], "prices": {}, "signatures": [], "timestamp": "123"}
    const res = parseData(
      'eyJtZXNzYWdlcyI6IFtdLCAicHJpY2VzIjoge30sICJzaWduYXR1cmVzIjogW10sICJ0aW1lc3RhbXAiOiAiMTIzIn0='
    );
    expect(typeof res.prices).toEqual('object');
    expect(Array.isArray(res.messages)).toBeTruthy();
    expect(Array.isArray(res.signatures)).toBeTruthy();
  });
});

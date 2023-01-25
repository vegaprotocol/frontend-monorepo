import { render } from '@testing-library/react';
import { JSONOracleData, parseData } from './data-submission-json-oracle';

describe('JSONOracleData', () => {
  it('renders a code block if there is a payload that is base64 encoded', () => {
    const p = 'eyJwcmljZXMuRVRIOTkudmFsdWUiOiAiMTMwNTAwMDAwMCJ9';
    const screen = render(<JSONOracleData payload={p} />);
    expect(screen.getByTestId('json-code')).toBeInTheDocument();
  });

  it('renders an error if b64 decoding fails', () => {
    const p = 'not-encoded';
    const screen = render(<JSONOracleData payload={p} />);

    expect(
      screen.getByText('Awaiting Block Explorer transaction details')
    ).toBeInTheDocument();
  });
});

describe('Parse JSON oracle data', () => {
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
    expect(typeof res).toEqual('string');
    expect(res).toEqual('test = true');
  });

  it('returns a string for b64 encoded json, without any extra parsing', () => {
    const res = parseData('eyJ0ZXN0Ijp0cnVlfQ==');
    expect(typeof res).toEqual('string');
    expect(res).toEqual('{"test":true}');
  });
});

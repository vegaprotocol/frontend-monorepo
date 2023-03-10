import { encodeBridgeCommand } from './bridge-command';

describe('Bridge command encoder', () => {
  const VALID_BYTES =
    '0x000000000000000000000000b063f5504610ba4b8db230d9f884bfadc1e31da00b87ac58d4af7fc11c8b417153fcb62631cfd9643835ef28db3f5a1caef0b3790000000000000000000000000000000000000000000000487a9a30453944000000000000000000000000000000000000000000000000000000000000000000010b87ac58d4af7fc11c8b417153fcb62631cfd9643835ef28db3f5a1caef0b37900000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000000a6c6973745f617373657400000000000000000000000000000000000000000000';
  const VALID_ADDRESS = '0x7fe27d970bc8Afc3B11Cc8d9737bfB66B1efd799';

  it('rejects non valid bridge addresses', () => {
    expect(() => {
      encodeBridgeCommand(VALID_BYTES, '456789');
    }).toThrowError('Bridge address must be a hex value');
  });

  it('throws if the bytes are not bytes-like', () => {
    expect(() => {
      encodeBridgeCommand('hello', VALID_ADDRESS);
    }).toThrowError(/invalid/);
  });

  it('keccac256s the value by default', () => {
    const res = encodeBridgeCommand(VALID_BYTES, VALID_ADDRESS);
    // Magic number: Known output, including 0x
    expect(res.length).toEqual(66);
  });

  it('Does not keccac256 the value if third param is set', () => {
    const res = encodeBridgeCommand(VALID_BYTES, VALID_ADDRESS, true);
    // Magic number: Known output
    expect(res.length).toEqual(706);
  });
});

import { hexToString, txSignatureToDeterministicId } from './deterministic-ids';

it('txSignatureToDeterministicId Turns a known signature in to a known deterministic ID', () => {
  const signature =
    '0f34fc11ffb7513295d8545a96f9628c388ef1aee028e94f0399fc5a4a7d867e5c5516ea3eec1d4ec4b2e80d8bc69ccdbde4af4494d7c9fe18450cb3a442e50e';
  const id = txSignatureToDeterministicId(signature);
  expect(id).toStrictEqual(
    '9df52e506304bf2efb0220506af688ffadbc8f52b6072b73c3694513b410137d'
  );
});

it('hexToString only accepts a hex string', () => {
  expect(() => {
    hexToString('test');
  }).toThrowError('is not a hex string');
});

it('hexToString encodes a known good value as bytes', () => {
  const hex = 'edd';
  const res = hexToString(hex);
  expect(res).toEqual([14, 221]);
});

import { createLog } from './logging';

const log = createLog('faucet-asset');

export async function faucetAsset(
  asset: string,
  party: string,
  amount = '10000'
) {
  log(`sending ${amount} ${asset} to ${party}`);
  const res = await fetch('http://localhost:1790/api/v1/mint', {
    method: 'post',
    body: JSON.stringify({
      amount,
      asset,
      party,
    }),
  });
  const json = await res.json();

  return json;
}

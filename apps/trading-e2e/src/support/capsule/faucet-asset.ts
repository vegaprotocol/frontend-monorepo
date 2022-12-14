export async function faucetAsset(assetId: string, vegaPubKey: string) {
  const res = await fetch('http://localhost:1790/api/v1/mint', {
    method: 'post',
    body: JSON.stringify({
      amount: '10000',
      asset: assetId,
      party: vegaPubKey,
    }),
  });
  const json = await res.json();

  return json;
}

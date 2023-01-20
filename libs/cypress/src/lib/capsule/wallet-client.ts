import type { Transaction } from '@vegaprotocol/wallet';

let url = '';
let token = '';
let requestId = 1;

// Note: cant use @vegaprotocol/wallet-client due to webpack oddly not
// being able to handle class syntax. Instead heres a super basic 'client'
// which only sends transactions
export function createWalletClient(walletUrl: string, walletToken: string) {
  url = walletUrl + '/api/v2/requests';
  token = walletToken;
}

export async function sendVegaTx(publicKey: string, transaction: Transaction) {
  if (!url || !token) {
    throw new Error('client not initialized');
  }

  const res = await request('client.send_transaction', {
    publicKey,
    transaction,
  });

  return res;
}

export function request(
  method: string,
  params: {
    publicKey: string;
    transaction: Transaction;
  }
) {
  const body = {
    jsonrpc: '2.0',
    method,
    params: {
      ...params,
      sendingMode: 'TYPE_SYNC',
    },
    id: (requestId++).toString(),
  };
  return fetch(url, {
    method: 'post',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `VWT ${token}`,
      Origin: 'market-setup',
      Referer: 'market-setup',
    },
  }).then((res) => {
    return res.json();
  });
}

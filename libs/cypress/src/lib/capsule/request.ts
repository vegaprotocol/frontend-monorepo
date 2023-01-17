import { request as gqlRequest } from 'graphql-request';

let walletEndpoint = '';
let gqlEndpoint = '';

export function setEndpoints(walletUrl: string, gqlUrl: string) {
  walletEndpoint = walletUrl + '/api/v2/requests';
  gqlEndpoint = gqlUrl;
}

export function request(method: string, params: object) {
  if (!walletEndpoint) {
    throw new Error('gqlEndpoint not set');
  }
  const body = {
    jsonrpc: '2.0',
    method,
    params,
    id: Math.random().toString(),
  };
  return fetch(walletEndpoint, {
    method: 'post',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      Origin: 'market-setup',
      Referer: 'market-setup',
    },
  }).then((res) => {
    return res.json();
  });
}

export function requestGQL<T>(query: string): Promise<T> {
  if (!gqlEndpoint) {
    throw new Error('gqlEndpoint not set');
  }
  return gqlRequest(gqlEndpoint, query);
}

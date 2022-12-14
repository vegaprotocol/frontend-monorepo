import { request as gqlRequest } from 'graphql-request';

const WALLET_ENDPOINT = 'http://localhost:1789/api/v2/requests';
const GQL_ENDPOINT = 'http://localhost:3028/query';

export function request(method: string, params: object) {
  const body = {
    jsonrpc: '2.0',
    method,
    params,
    id: Math.random().toString(),
  };
  return fetch(WALLET_ENDPOINT, {
    method: 'post',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      Origin: 'my script',
      Referer: 'my script',
    },
  }).then((res) => {
    return res.json();
  });
}

export function requestGQL<T>(query: string): Promise<T> {
  return gqlRequest(GQL_ENDPOINT, query);
}

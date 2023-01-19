import { request } from 'graphql-request';

let gqlEndpoint = '';

export function setGraphQLEndpoint(gqlUrl: string) {
  gqlEndpoint = gqlUrl;
}

export function requestGQL<T>(query: string): Promise<T> {
  if (!gqlEndpoint) {
    throw new Error('gqlEndpoint not set');
  }
  return request(gqlEndpoint, query);
}

import trimEnd from 'lodash/trimEnd';
import path from 'path';
import { getBaseUrl } from './rest-config';
import tradingDataApi from '@vegaprotocol/rest-clients/paths/trading_data_v2.json';

export type ApiPath = keyof typeof tradingDataApi;

/**
 * Creates the URL to the REST API endpoint.
 * @param apiPath The path to the API, e.g. /api/v2/assets
 * @param replacements The replacements for the path variables, e.g. restApiUrl("/api/v2/asset/{assetId}", { assetId: "123456789" })
 */
export function restApiUrl(
  apiPath?: ApiPath,
  replacements?: Record<string, string>
) {
  const baseUrl = getBaseUrl();

  const base = trimEnd(baseUrl, '/');

  if (apiPath && replacements) {
    const pathParameters = tradingDataApi[apiPath] as string[];
    const parameters = Object.keys(replacements);

    for (const param of parameters) {
      if (!pathParameters.includes(param)) {
        throw new Error(
          `The path ${apiPath} does not have ${param} as a path parameter`
        );
      }
    }

    let p = apiPath as string;
    if (p && replacements) {
      for (const [k, v] of Object.entries(replacements)) {
        p = p.replace(`{${k}}`, v);
      }
    }

    return path.join(base, p);
  }

  return base;
}

/**
 * Creates the URL to the WebSocket API endpoint.
 */
export function webSocketApiUrl(
  apiPath?: ApiPath,
  replacements?: Record<string, string>
) {
  const url = new URL(restApiUrl(apiPath, replacements));
  url.protocol = 'wss:';
  return url.toString();
}

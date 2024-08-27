import trimEnd from 'lodash/trimEnd';
import path from 'path';
import tradingDataApi from '@vegaprotocol/rest-clients/paths/trading_data_v2.json';
import { useEnvironment } from '@vegaprotocol/environment';

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

  if (apiPath) {
    const pathParameters = tradingDataApi[apiPath] as string[];
    let p = apiPath as string;

    if (pathParameters.length > 0) {
      if (!replacements) {
        throw new Error(
          `The path ${apiPath} requires the following parameters: ${pathParameters.join(
            ', '
          )}`
        );
      }

      for (const [k, v] of Object.entries(replacements)) {
        if (!pathParameters.includes(k)) {
          throw new Error(
            `The path ${apiPath} does not have ${k} as a path parameter`
          );
        }
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

function getBaseUrl() {
  const bu = useEnvironment.getState().API_NODE?.restApiUrl;
  if (!bu) {
    throw new Error('Base URL is not defined');
  }

  return bu;
}

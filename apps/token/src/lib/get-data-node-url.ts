import { ENV } from '../config/env';

export function getDataNodeUrl() {
  const base = ENV.vegaUrl;
  if (!base) {
    throw new Error('Environment variable NX_VEGA_URL must be set');
  }
  const urlHTTP = new URL(base);
  const urlWS = new URL(base);
  // Replace http with ws, preserving if its a secure connection eg. https => wss
  urlWS.protocol = urlWS.protocol.replace('http', 'ws');

  return {
    base,
    graphql: urlHTTP.href,
    graphqlWebsocket: urlWS.href,
  };
}

import trim from 'lodash/trim';
import { Networks, useEnvironment } from '@vegaprotocol/environment';
import { useCallback } from 'react';

type DApp = 'console' | 'console-fairground' | 'token' | 'explorer';
export const useLinks = (dapp: DApp) => {
  const { VEGA_ENV, VEGA_NETWORKS, VEGA_TOKEN_URL, VEGA_EXPLORER_URL } =
    useEnvironment();

  const urls: { [k in DApp]: string } = {
    console: VEGA_NETWORKS[VEGA_ENV] || '',
    'console-fairground': VEGA_NETWORKS[Networks.TESTNET] || '',
    token: VEGA_TOKEN_URL || '',
    explorer: VEGA_EXPLORER_URL || '',
  };
  const baseUrl = trim(urls[dapp], '/');

  const link = useCallback(
    (url?: string) => `${baseUrl}/${trim(url, '/') || ''}`,
    [baseUrl]
  );
  return link;
};

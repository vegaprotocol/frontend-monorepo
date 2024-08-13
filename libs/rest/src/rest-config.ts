import { useEnvironment } from '@vegaprotocol/environment';

export const getBaseUrl = () => {
  const bu = useEnvironment.getState().API_NODE?.restApiUrl;
  if (!bu) {
    throw new Error('Base URL is not defined');
  }

  return bu;
};

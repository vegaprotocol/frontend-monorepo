import { gql } from 'graphql-request';
import { requestGQL } from './request';

export async function getEthereumConfig() {
  const query = gql`
    {
      networkParameter(key: "blockchains.ethereumConfig") {
        value
      }
    }
  `;

  const res = await requestGQL<{
    networkParameter: {
      key: string;
      value: string;
    };
  }>(query);
  return JSON.parse(res.networkParameter.value);
}

import { type Oracle } from './use-oracle';
import { type Provider } from './use-oracle-providers';

export const getMatchingOracleProvider = (
  providers: Provider[],
  data?: Oracle['data']
) => {
  if (!data) {
    return;
  }

  return providers.find((provider) => {
    let oracleSignature = '';

    const oracle = provider.oracle;

    if ('public_key' in oracle && oracle.public_key) {
      oracleSignature = oracle.public_key;
    } else if ('eth_address' in oracle && oracle.eth_address) {
      oracleSignature = oracle.eth_address;
    }

    if (!oracleSignature) {
      return false;
    }

    // Market does not have
    if (
      data.sourceType.__typename !== 'DataSourceDefinitionExternal' ||
      !data.sourceType.sourceType
    ) {
      return false;
    }

    // EthCallSpec, just match the sourceType address
    if (
      data.sourceType.sourceType.__typename === 'EthCallSpec' &&
      data.sourceType.sourceType.address === oracleSignature
    ) {
      return true;
    }

    if ('signers' in data.sourceType.sourceType) {
      return data.sourceType.sourceType.signers?.some(
        (signer) =>
          (signer.signer.__typename === 'ETHAddress' &&
            signer.signer.address === oracleSignature) ||
          (signer.signer.__typename === 'PubKey' &&
            signer.signer.key === oracleSignature)
      );
    }

    return false;
  });
};

import type { Provider } from '../oracle-schema';
import type { OracleMarketSpecFieldsFragment } from '../__generated__/OracleMarketsSpec';
import { useOracleMarketsSpecQuery } from '../__generated__/OracleMarketsSpec';

export const useOracleMarkets = (
  provider: Provider
): OracleMarketSpecFieldsFragment[] | undefined => {
  let oracleSignature: string;
  const oracle = provider.oracle;
  if ('public_key' in oracle && oracle.public_key) {
    oracleSignature = oracle.public_key;
  }
  if ('eth_address' in oracle && oracle.eth_address) {
    oracleSignature = oracle.eth_address;
  }

  const { data: markets } = useOracleMarketsSpecQuery();

  const oracleMarkets = markets?.marketsConnection?.edges
    ?.map((edge) => edge.node)
    ?.filter((node) => {
      const p = node.tradableInstrument.instrument.product;
      const sourceType = p.dataSourceSpecForSettlementData.data.sourceType;
      if (sourceType.__typename !== 'DataSourceDefinitionExternal') {
        return false;
      }
      const signers = sourceType?.sourceType.signers;
      const signerKeys = signers?.filter(Boolean).map((signer) => {
        if (signer.signer.__typename === 'ETHAddress') {
          return signer.signer.address;
        }
        if (signer.signer.__typename === 'PubKey') {
          return signer.signer.key;
        }
        return undefined;
      });
      const key = signerKeys?.find((key) => key === oracleSignature);
      return !!key;
    });
  return oracleMarkets;
};

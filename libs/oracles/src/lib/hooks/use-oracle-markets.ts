import type { Provider } from '../oracle-schema';
import type { OracleMarketSpecFieldsFragment } from '../__generated__/OracleMarketsSpec';
import { useOracleMarketsSpecQuery } from '../__generated__/OracleMarketsSpec';

export const useOracleMarkets = (
  provider: Provider
): OracleMarketSpecFieldsFragment[] | undefined => {
  const signedProofs = provider.proofs.filter(
    (proof) => proof.format === 'signed_message' && proof.available === true
  );

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

      const signedProofsKeys = signedProofs.map((proof) => {
        if ('public_key' in proof && proof.public_key) {
          return proof.public_key;
        }
        if ('eth_address' in proof && proof.eth_address) {
          return proof.eth_address;
        }
        return undefined;
      });

      const key = signedProofsKeys.find((key) => signerKeys?.includes(key));
      return !!key;
    });
  return oracleMarkets;
};

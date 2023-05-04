import type { Provider } from '../oracle-schema';
import type {
  OracleMarketSpecFieldsFragment} from '../__generated__/OracleMarketsSpec';
import {
  useOracleMarketsSpecQuery
} from '../__generated__/OracleMarketsSpec';

export const useOracleMarkets = (
  provider: Provider
): OracleMarketSpecFieldsFragment[] | undefined => {
  console.log('provider', provider);
  const signedProofs = provider.proofs.filter(
    (proof) => proof.format === 'signed_message' && proof.available === true
  );

  const { data: markets } = useOracleMarketsSpecQuery();

  console.log('markets spec', markets);

  const oracleMarkets = markets?.marketsConnection?.edges
    ?.map((edge) => edge.node)
    ?.filter((node) => {
      const p = node.tradableInstrument.instrument.product;
      const sourceType = p.dataSourceSpecForSettlementData.data.sourceType;
      if (sourceType.__typename !== 'DataSourceDefinitionExternal') {
        return false;
      }
      const signers = sourceType?.sourceType.signers;

      const signerKeys = signers?.map(
        (signer) =>
          (signer?.signer.__typename === 'ETHAddress' &&
            signer?.signer.address) ||
          (signer?.signer.__typename === 'PubKey' && signer?.signer.key)
      );

      const signedProofsKeys = signedProofs.map(
        (proof) =>
          ('public_key' in proof && proof.public_key) ||
          ('eth_address' in proof && proof.eth_address)
      );

      const key = signedProofsKeys.find((key) => signerKeys?.includes(key));
      return !!key;
    });

  console.log('useOracleMarkets called', oracleMarkets);
  return oracleMarkets;
};

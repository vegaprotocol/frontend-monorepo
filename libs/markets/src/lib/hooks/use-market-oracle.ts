import { useEnvironment } from '@vegaprotocol/environment';
import { useOracleProofs } from './use-oracle-proofs';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { marketInfoProvider } from '../components/market-info/market-info-data-provider';
import { useMemo } from 'react';
import type { Provider } from '../oracle-schema';
import type { DataSourceSpecFragment } from '../__generated__/OracleMarketsSpec';

export const getMatchingOracleProvider = (
  dataSourceSpec: DataSourceSpecFragment,
  providers: Provider[]
) =>
  providers.find((provider) =>
    provider.proofs.some((proof) => {
      if (
        proof.type === 'eth_address' &&
        dataSourceSpec.sourceType.__typename === 'DataSourceDefinitionExternal'
      ) {
        return dataSourceSpec.sourceType.sourceType.signers?.some(
          (signer) =>
            signer.signer.__typename === 'ETHAddress' &&
            signer.signer.address === proof.eth_address
        );
      }
      if (
        proof.type === 'public_key' &&
        dataSourceSpec.sourceType.__typename === 'DataSourceDefinitionExternal'
      ) {
        return dataSourceSpec.sourceType.sourceType.signers?.some(
          (signer) =>
            signer.signer.__typename === 'PubKey' &&
            signer.signer.key === proof.public_key
        );
      }
      return false;
    })
  );

export const useMarketOracle = (
  marketId: string,
  dataSourceType:
    | 'dataSourceSpecForSettlementData'
    | 'dataSourceSpecForTradingTermination' = 'dataSourceSpecForSettlementData'
) => {
  const { ORACLE_PROOFS_URL } = useEnvironment();
  const { data: marketInfo } = useDataProvider({
    dataProvider: marketInfoProvider,
    variables: { marketId },
  });
  const { data: providers } = useOracleProofs(ORACLE_PROOFS_URL);
  return useMemo(() => {
    if (!providers || !marketInfo) {
      return undefined;
    }
    const dataSourceSpec =
      marketInfo.tradableInstrument.instrument.product[dataSourceType];
    const provider = getMatchingOracleProvider(dataSourceSpec.data, providers);
    if (provider) {
      return { provider, dataSourceSpecId: dataSourceSpec.id };
    }
    return undefined;
  }, [marketInfo, dataSourceType, providers]);
};

import { useEnvironment } from '@vegaprotocol/environment';
import { useOracleProofs } from './use-oracle-proofs';
import { useMarket } from '../markets-provider';

import { useMemo } from 'react';
import type { Provider } from '../oracle-schema';
import type { DataSourceSpecFragment } from '../__generated__';

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
): {
  data?: {
    provider: NonNullable<ReturnType<typeof getMatchingOracleProvider>>;
    dataSourceSpecId: string;
  };
  loading?: boolean;
} => {
  const { ORACLE_PROOFS_URL } = useEnvironment();
  const { data: market, loading: marketLoading } = useMarket(marketId);
  const { data: providers, loading: providersLoading } =
    useOracleProofs(ORACLE_PROOFS_URL);
  return useMemo(() => {
    if (marketLoading || providersLoading) {
      return { loading: true };
    }
    if (!providers || !market) {
      return { data: undefined };
    }
    const dataSourceSpec =
      market.tradableInstrument.instrument.product[dataSourceType];
    const provider = getMatchingOracleProvider(dataSourceSpec.data, providers);
    if (provider) {
      return { data: { provider, dataSourceSpecId: dataSourceSpec.id } };
    }
    return { data: undefined };
  }, [market, dataSourceType, providers, marketLoading, providersLoading]);
};

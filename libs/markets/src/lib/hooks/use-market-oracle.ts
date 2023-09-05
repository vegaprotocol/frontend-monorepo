import { useEnvironment } from '@vegaprotocol/environment';
import { useOracleProofs } from './use-oracle-proofs';
import { useMarket } from '../markets-provider';

import { useMemo } from 'react';
import type { Provider } from '../oracle-schema';
import {
  getDataSourceSpecForSettlementData,
  getDataSourceSpecForTradingTermination,
} from '../product';
import type { DataSourceFragment } from '../components';

export const getMatchingOracleProvider = (
  dataSourceSpec: DataSourceFragment['data'],
  providers: Provider[]
) => {
  return providers.find((provider) => {
    let oracleSignature: string;
    const oracle = provider.oracle;
    if ('public_key' in oracle && oracle.public_key) {
      oracleSignature = oracle.public_key;
    } else if ('eth_address' in oracle && oracle.eth_address) {
      oracleSignature = oracle.eth_address;
    }

    if (
      dataSourceSpec.sourceType.__typename === 'DataSourceDefinitionExternal' &&
      'signers' in dataSourceSpec.sourceType.sourceType
    ) {
      return dataSourceSpec.sourceType.sourceType.signers?.some(
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

export const useMarketOracle = (
  marketId: string,
  dataSourceType:
    | 'dataSourceSpecForSettlementData'
    | 'dataSourceSpecForTradingTermination'
    | 'dataSourceSpecForSettlementSchedule' = 'dataSourceSpecForSettlementData'
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
    let dataSourceSpec: DataSourceFragment | undefined = undefined;
    const { product } = market.tradableInstrument.instrument;
    if (dataSourceType === 'dataSourceSpecForSettlementData') {
      dataSourceSpec = getDataSourceSpecForSettlementData(product);
    }
    if (dataSourceType === 'dataSourceSpecForSettlementSchedule') {
      dataSourceSpec = getDataSourceSpecForSettlementData(product);
    }
    if (dataSourceType === 'dataSourceSpecForTradingTermination') {
      dataSourceSpec = getDataSourceSpecForTradingTermination(product);
    }

    const provider =
      dataSourceSpec &&
      getMatchingOracleProvider(dataSourceSpec.data, providers);
    if (provider && dataSourceSpec) {
      return { data: { provider, dataSourceSpecId: dataSourceSpec.id } };
    }
    return { data: undefined };
  }, [market, dataSourceType, providers, marketLoading, providersLoading]);
};

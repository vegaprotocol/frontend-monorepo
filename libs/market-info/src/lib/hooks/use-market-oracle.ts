import { useEnvironment } from '@vegaprotocol/environment';
import { useOracleProofs } from './use-oracle-proofs';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { marketInfoProvider } from '../components/market-info/market-info-data-provider';
import { useMemo } from 'react';

export const useMarketOracle = (
  marketId: string,
  dataSourceSpecKey:
    | 'dataSourceSpecForSettlementData'
    | 'dataSourceSpecForTradingTermination' = 'dataSourceSpecForSettlementData'
) => {
  const { ORACLE_PROOFS_URL } = useEnvironment();
  const { data: marketInfo } = useDataProvider({
    dataProvider: marketInfoProvider,
    variables: { marketId },
  });
  const { data } = useOracleProofs(ORACLE_PROOFS_URL);
  return useMemo(() => {
    if (!data || !marketInfo) {
      return undefined;
    }
    const dataSourceSpec =
      marketInfo.tradableInstrument.instrument.product[dataSourceSpecKey];
    const { data: dataSource, id: dataSourceSpecId } = dataSourceSpec;
    const provider = data.find((provider) =>
      provider.proofs.some((proof) => {
        if (
          proof.type === 'eth_address' &&
          dataSource.sourceType.__typename === 'DataSourceDefinitionExternal'
        ) {
          return dataSource.sourceType.sourceType.signers?.some(
            (signer) =>
              signer.signer.__typename === 'ETHAddress' &&
              signer.signer.address === proof.eth_address
          );
        }
        if (
          proof.type === 'public_key' &&
          dataSource.sourceType.__typename === 'DataSourceDefinitionExternal'
        ) {
          return dataSource.sourceType.sourceType.signers?.some(
            (signer) =>
              signer.signer.__typename === 'PubKey' &&
              signer.signer.key === proof.public_key
          );
        }
        return false;
      })
    );
    if (provider) {
      return { provider, dataSourceSpecId };
    }
    return undefined;
  }, [data, dataSourceSpecKey, marketInfo]);
};

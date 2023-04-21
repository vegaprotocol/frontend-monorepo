import { useEnvironment } from '@vegaprotocol/environment';
import { useOracleProofs } from '@vegaprotocol/oracles';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import { marketInfoProvider } from '../components/market-info/market-info-data-provider';
import { useMemo } from 'react';

export const useMarketOracle = (marketId: string) => {
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
    const dataSource =
      marketInfo.tradableInstrument.instrument.product
        .dataSourceSpecForSettlementData.data;
    return data.find((provider) =>
      provider.proofs.some(
        (proof) =>
          (proof.type === 'eth_address' &&
            dataSource.sourceType.__typename ===
              'DataSourceDefinitionExternal' &&
            dataSource.sourceType.sourceType.signers?.some(
              (signer) =>
                signer.signer.__typename === 'ETHAddress' &&
                signer.signer.address === proof.eth_address
            )) ||
          (proof.type === 'public_key' &&
            dataSource.sourceType.__typename ===
              'DataSourceDefinitionExternal' &&
            dataSource.sourceType.sourceType.signers?.some(
              (signer) =>
                signer.signer.__typename === 'PubKey' &&
                signer.signer.key === proof.public_key
            ))
      )
    )?.oracle;
  }, [data, marketInfo]);
};

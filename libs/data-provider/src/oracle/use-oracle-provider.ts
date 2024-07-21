import { useOracle } from './use-oracle';
import { useOracleProviders } from './use-oracle-providers';
import { getMatchingOracleProvider } from './utils';

export const useOracleProvider = ({
  oracleSpecId,
}: {
  oracleSpecId?: string;
}) => {
  const { data: providers } = useOracleProviders();
  const { data: oracleSpec } = useOracle({ oracleSpecId });

  if (!oracleSpec || !providers) return;

  return getMatchingOracleProvider(oracleSpec.data, providers);
};

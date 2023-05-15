import { useOracleSpecDataConnectionQuery } from '../__generated__/OracleSpecDataConnection';

export const useOracleSpecBindingData = (
  oracleSpecId: string | undefined,
  specBinding: string | undefined
) => {
  const { data, loading, error } = useOracleSpecDataConnectionQuery({
    variables: {
      oracleSpecId: oracleSpecId || '',
    },
    skip: !oracleSpecId,
  });

  const dataConnectionEdges = data?.oracleSpec?.dataConnection.edges;
  const firstDataConnection = dataConnectionEdges?.[0]?.node;
  const property = firstDataConnection?.externalData.data.data?.find(
    (d) => d.name === specBinding
  );

  return {
    property,
    data,
    loading,
    error,
  };
};

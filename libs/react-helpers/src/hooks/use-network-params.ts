import { useNetworkParametersQuery } from './__generated__/NetworkParameters';

export const useNetworkParam = (param: string) => {
  const { data, loading, error } = useNetworkParametersQuery();
  const foundParams = data?.networkParametersConnection.edges?.filter(
    (p) => param === p?.node.key
  );
  return {
    data: foundParams ? foundParams.map((f) => f?.node.value) : null,
    loading,
    error,
  };
};

export const useNetworkParams = (params: string[]) => {
  const { data, loading, error } = useNetworkParametersQuery();
  const foundParams = data?.networkParametersConnection.edges
    ?.filter((p) => params.includes(p?.node.key ?? ''))
    .sort(
      (a, b) =>
        params.indexOf(a?.node.key ?? '') - params.indexOf(b?.node.key ?? '')
    );
  return {
    data: foundParams ? foundParams.map((f) => f?.node.value) : null,
    loading,
    error,
  };
};

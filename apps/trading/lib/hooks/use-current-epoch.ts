import { useEpochInfoQuery } from './__generated__/Epoch';

export const useCurrentEpoch = () => {
  let currentEpoch;

  const { data, loading, error } = useEpochInfoQuery({
    fetchPolicy: 'network-only',
  });

  currentEpoch = Number(data?.epoch.id);
  if (isNaN(currentEpoch)) currentEpoch = undefined;

  return {
    data: currentEpoch,
    loading,
    error,
  };
};

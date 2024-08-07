import { useEpochInfoQuery } from './__generated__/Epoch';

export const useCurrentEpoch = () => {
  const { data, ...queryResult } = useEpochInfoQuery({
    fetchPolicy: 'network-only',
  });

  const timestamps = data?.epoch.timestamps;
  const id = data?.epoch.id;

  return {
    ...queryResult,
    data: {
      id: id ? Number(id) : undefined,
      timestamps: {
        start: timestamps?.start ? new Date(timestamps.start) : undefined,
        end: timestamps?.end ? new Date(timestamps.end) : undefined,
        expiry: timestamps?.expiry ? new Date(timestamps.expiry) : undefined,
      },
    },
  };
};

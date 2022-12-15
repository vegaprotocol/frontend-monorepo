import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { EpochCountdown } from '../../../components/epoch-countdown';
import { useNodesQuery } from './__generated___/Nodes';
import { usePreviousEpochQuery } from '../__generated___/PreviousEpoch';
import { ValidatorTables } from './validator-tables';
import { useRefreshValidators } from '../../../hooks/use-refresh-validators';

export const EpochData = () => {
  // errorPolicy due to vegaprotocol/vega issue 5898
  const { data, error, loading, refetch } = useNodesQuery();
  const { data: previousEpochData } = usePreviousEpochQuery({
    variables: {
      epochId: (Number(data?.epoch.id) - 1).toString(),
    },
    skip: !data?.epoch.id,
  });

  useRefreshValidators(data?.epoch.timestamps.expiry, refetch);

  return (
    <AsyncRenderer loading={loading} error={error} data={data}>
      {data?.epoch &&
        data.epoch.timestamps.start &&
        data?.epoch.timestamps.expiry && (
          <div className="mb-10">
            <EpochCountdown
              id={data.epoch.id}
              startDate={new Date(data.epoch.timestamps.start)}
              endDate={new Date(data.epoch.timestamps.expiry)}
            />
          </div>
        )}
      <ValidatorTables data={data} previousEpochData={previousEpochData} />
    </AsyncRenderer>
  );
};

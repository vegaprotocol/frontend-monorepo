import { useEffect } from 'react';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { EpochCountdown } from '../../../components/epoch-countdown';
import { Schema } from '@vegaprotocol/types';
import { useNodesQuery } from './__generated___/Nodes';
import { usePreviousEpochQuery } from './__generated___/PreviousEpoch';
import { ValidatorTables } from './validator-tables';
import { NetworkParams, useNetworkParams } from '@vegaprotocol/react-helpers';

export const statusTranslationKey = (status: Schema.ValidatorStatus) => {
  // Returns a key for translation
  const statuses = {
    [Schema.ValidatorStatus.VALIDATOR_NODE_STATUS_ERSATZ]: 'status-ersatz',
    [Schema.ValidatorStatus.VALIDATOR_NODE_STATUS_PENDING]: 'status-pending',
    [Schema.ValidatorStatus.VALIDATOR_NODE_STATUS_TENDERMINT]:
      'status-tendermint',
  };

  return statuses[status];
};

export const NodeList = () => {
  // errorPolicy due to vegaprotocol/vega issue 5898
  const { data, error, loading, refetch } = useNodesQuery();
  const { data: previousEpochData, refetch: previousEpochRefetch } =
    usePreviousEpochQuery({
      variables: {
        epochId: (Number(data?.epoch.id) - 1).toString(),
      },
    });

  useEffect(() => {
    const epochInterval = setInterval(() => {
      if (!data?.epoch.timestamps.expiry) return;
      const now = Date.now();
      const expiry = new Date(data.epoch.timestamps.expiry).getTime();

      if (now > expiry) {
        refetch();
        previousEpochRefetch({
          epochId: (Number(data?.epoch.id) - 1).toString(),
        });
        clearInterval(epochInterval);
      }
    }, 10000);

    return () => {
      clearInterval(epochInterval);
    };
  }, [
    data?.epoch.id,
    data?.epoch.timestamps.expiry,
    previousEpochRefetch,
    refetch,
  ]);

  return (
    <AsyncRenderer loading={loading} error={error} data={data}>
      {data?.epoch &&
        data.epoch.timestamps.start &&
        data?.epoch.timestamps.expiry && (
          <div className="mb-8">
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

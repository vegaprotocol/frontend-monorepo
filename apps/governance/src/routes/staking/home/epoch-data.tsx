import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { EpochCountdown } from '../../../components/epoch-countdown';
import { useNodesQuery } from './__generated__/Nodes';
import { useStakingQuery } from '../__generated__/Staking';
import { usePreviousEpochQuery } from '../__generated__/PreviousEpoch';
import { ValidatorTables } from './validator-tables';
import { useRefreshAfterEpoch } from '../../../hooks/use-refresh-after-epoch';
import { useVegaWallet } from '@vegaprotocol/wallet';

export const EpochData = () => {
  // errorPolicy due to vegaprotocol/vega issue 5898
  const { pubKey } = useVegaWallet();
  const {
    data: nodesData,
    error: nodesError,
    loading: nodesLoading,
    refetch,
  } = useNodesQuery();
  const { data: userStakingData } = useStakingQuery({
    variables: {
      partyId: pubKey || '',
    },
  });
  const { data: previousEpochData } = usePreviousEpochQuery({
    variables: {
      epochId: (Number(nodesData?.epoch.id) - 1).toString(),
    },
    skip: !nodesData?.epoch.id,
  });

  useRefreshAfterEpoch(nodesData?.epoch.timestamps.expiry, refetch);

  return (
    <AsyncRenderer loading={nodesLoading} error={nodesError} data={nodesData}>
      {nodesData?.epoch &&
        nodesData.epoch.timestamps.start &&
        nodesData?.epoch.timestamps.expiry && (
          <div className="mb-10">
            <EpochCountdown
              id={nodesData.epoch.id}
              startDate={new Date(nodesData.epoch.timestamps.start)}
              endDate={new Date(nodesData.epoch.timestamps.expiry)}
            />
          </div>
        )}
      <ValidatorTables
        nodesData={nodesData}
        userStakingData={userStakingData}
        previousEpochData={previousEpochData}
      />
    </AsyncRenderer>
  );
};

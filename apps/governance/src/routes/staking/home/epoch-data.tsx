import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { EpochCountdown } from '../../../components/epoch-countdown';
import { useNodesQuery } from './__generated__/Nodes';
import { useStakingQuery } from '../__generated__/Staking';
import { usePreviousEpochQuery } from '../__generated__/PreviousEpoch';
import { ValidatorTables } from './validator-tables';
import { useRefreshAfterEpoch } from '../../../hooks/use-refresh-after-epoch';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { ENV } from '../../../config';
import { getMultisigStatusInfo } from '../../../lib/get-multisig-status-info';
import { MultisigIncorrectNotice } from '../../../components/multisig-incorrect-notice';

export const EpochData = () => {
  // errorPolicy due to vegaprotocol/vega issue 5898
  const { pubKey } = useVegaWallet();
  const {
    data: nodesData,
    error: nodesError,
    loading: nodesLoading,
    refetch: nodesRefetch,
  } = useNodesQuery();

  const { delegationsPagination } = ENV;
  const {
    data: userStakingData,
    error: userStakingError,
    loading: userStakingLoading,
    refetch: userStakingRefetch,
  } = useStakingQuery({
    variables: {
      partyId: pubKey || '',
      delegationsPagination: delegationsPagination
        ? {
            first: Number(delegationsPagination),
          }
        : undefined,
    },
  });
  const { data: previousEpochData } = usePreviousEpochQuery({
    variables: {
      epochId: (Number(nodesData?.epoch.id) - 1).toString(),
    },
    skip: !nodesData?.epoch.id,
  });

  useRefreshAfterEpoch(nodesData?.epoch.timestamps.expiry, () => {
    nodesRefetch();
    userStakingRefetch();
  });

  const multisigStatus = previousEpochData
    ? getMultisigStatusInfo(previousEpochData)
    : undefined;

  return (
    <AsyncRenderer
      loading={nodesLoading || userStakingLoading}
      error={nodesError || userStakingError}
      data={nodesData}
    >
      {multisigStatus?.showMultisigStatusError ? (
        <MultisigIncorrectNotice />
      ) : null}

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

import { useDataProvider } from '@vegaprotocol/react-helpers';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { enabledAssetsProvider } from '@vegaprotocol/assets';
import { accountsOnlyDataProvider } from '@vegaprotocol/accounts';
import type { WithdrawalArgs } from './use-create-withdraw';
import { WithdrawManager } from './withdraw-manager';
import { useMemo } from 'react';
import { t } from '@vegaprotocol/react-helpers';

interface WithdrawFormContainerProps {
  partyId?: string;
  submit: (args: WithdrawalArgs) => void;
  assetId?: string;
}

export const WithdrawFormContainer = ({
  assetId,
  partyId,
  submit,
}: WithdrawFormContainerProps) => {
  const variables = useMemo(() => ({ partyId }), [partyId]);
  const { data, loading, error } = useDataProvider({
    dataProvider: accountsOnlyDataProvider,
    variables,
    noUpdate: true,
  });

  const {
    data: assets,
    loading: assetsLoading,
    error: assetsError,
  } = useDataProvider({
    dataProvider: enabledAssetsProvider,
  });

  return (
    <AsyncRenderer
      loading={loading && assetsLoading}
      error={error && assetsError}
      data={data}
      noDataMessage={t('You have no assets to withdraw')}
    >
      {assets && data && (
        <WithdrawManager
          assetId={assetId}
          assets={assets}
          accounts={data}
          submit={submit}
        />
      )}
    </AsyncRenderer>
  );
};

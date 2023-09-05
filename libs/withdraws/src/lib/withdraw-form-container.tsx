import { useMemo } from 'react';
import { toBigNum } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { accountsDataProvider } from '@vegaprotocol/accounts';
import type { WithdrawalArgs } from './use-create-withdraw';
import { WithdrawManager } from './withdraw-manager';
import * as Types from '@vegaprotocol/types';

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
  const { data, loading, error } = useDataProvider({
    dataProvider: accountsDataProvider,
    variables: { partyId: partyId || '' },
  });

  const filteredAsset = useMemo(
    () =>
      data
        ?.filter(
          (account) =>
            account.type === Types.AccountType.ACCOUNT_TYPE_GENERAL &&
            toBigNum(account.balance, account.asset.decimals).isGreaterThan(0)
        )
        .map((account) => account.asset),
    [data]
  );
  const assets = filteredAsset?.length ? filteredAsset : null;
  return (
    <AsyncRenderer
      loading={loading}
      error={error}
      data={assets}
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

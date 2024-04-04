import { useMemo } from 'react';
import { toBigNum } from '@vegaprotocol/utils';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { AsyncRendererInline } from '@vegaprotocol/ui-toolkit';
import { accountsDataProvider } from '@vegaprotocol/accounts';

import { WithdrawManager } from './withdraw-manager';
import * as Types from '@vegaprotocol/types';
import type { WithdrawalArgs } from './withdraw-form';
import { useT } from './use-t';

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
  const t = useT();
  const { data, loading, error } = useDataProvider({
    dataProvider: accountsDataProvider,
    variables: { partyId: partyId || '' },
    skip: true,
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
    <AsyncRendererInline
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
    </AsyncRendererInline>
  );
};

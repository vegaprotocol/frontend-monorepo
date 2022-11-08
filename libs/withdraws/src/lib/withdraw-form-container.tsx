import { useMemo } from 'react';
import uniqBy from 'lodash/uniqBy';
import { useDataProvider, t } from '@vegaprotocol/react-helpers';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { accountsDataProvider } from '@vegaprotocol/accounts';
import type { WithdrawalArgs } from './use-create-withdraw';
import { WithdrawManager } from './withdraw-manager';

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
    dataProvider: accountsDataProvider,
    variables,
    noUpdate: true,
  });
  const assets = data
    ? uniqBy(
        data.map((account) => account.asset),
        'id'
      )
    : null;

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

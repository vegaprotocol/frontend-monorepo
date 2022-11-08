import { useMemo } from 'react';
import uniqBy from 'lodash/uniqBy';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { accountsDataProvider } from '@vegaprotocol/accounts';
import type { WithdrawalArgs } from './use-create-withdraw';
import { WithdrawManager } from './withdraw-manager';
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
    dataProvider: accountsDataProvider,
    variables,
    noUpdate: true,
  });
  const assets = uniqBy(
    data?.map((account) => account.asset),
    'id'
  );

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
